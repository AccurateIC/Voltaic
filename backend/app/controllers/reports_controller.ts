import type { HttpContext } from "@adonisjs/core/http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "url";

import { spawn } from "node:child_process";
import Archive from "#models/archive";
import { getPdfPropertyBetweenValidator, getAnomalyStatisticsValidator } from "../validators/archive.js";
import { DateTime } from "luxon";
import { ArchiveService } from "#services/archive_service";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const typstBase = `
// packages
#import "@preview/lilaq:0.2.0" as lq
#import "@preview/cetz:0.4.0"
#import "@preview/cetz-plot:0.1.2": chart

// set doc metadata
#set document(author: "NeuroGen", title: "NeuroGen Report")

// font style
#set text(font: "New Computer Modern", size: 10pt, lang: "en", ligatures: false)

// page properties
#set page(margin: 0.5in, paper: "a4")

// Small caps for section titles
#show heading.where(level: 2): it => [
  #pad(top: 0pt, bottom: -10pt, [#smallcaps(it.body)])
  #line(length: 100%, stroke: 0.1pt)
]
// Name will be aligned left, bold and big
#show heading.where(level: 1): it => [
  #set align(center)
  #set text(weight: 500, size: 24pt)
  #pad([#smallcaps(it.body)])
]
`;

const compilePdf = (tmpFile: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const compileProc = spawn("typst", ["compile", tmpFile, "-"]);
    const pdfBuffers: Buffer[] = [];
    compileProc.stdout.on("data", (chunk) => {
      pdfBuffers.push(chunk);
    });
    compileProc.stderr.on("data", (data) => {
      reject(data.toString());
    });
    compileProc.on("close", async (code) => {
      // await fs.unlink(tmpFile).catch(console.error);
      if (code !== 0) reject(`Compiler exited with code ${code}`);
      resolve(Buffer.concat(pdfBuffers));
    });
  });
};

export default class ReportsController {
  async getData(): Promise<Archive[]> {
    const archiveData = Archive.all();
    return archiveData as Promise<Archive[]>;
  }
  async generateDummy({ request, response }: HttpContext) {
    // make a temporary typst file with .typ extension
    const tmpFile = path.join(__dirname, "report.typ");
    try {

      const resultData = await ArchiveService.getPropertyStatistics({ request });
     console.log("resultData", resultData);

      const reusableData = await request.validateUsing(getPdfPropertyBetweenValidator);
      //  console.log("reusableData, ", reusableData);
      const propertyNames = reusableData.properties || [];

      // add data from db to typst doc
      const query = Archive.query();

      // filter by property names
      query.whereHas("gensetProperty", (propertyQuery) => {
        propertyQuery.whereIn("propertyName", propertyNames);
      });

      // preload
      query.preload("gensetProperty", (preloadQuery) => {
        preloadQuery.preload("physicalQuantity");
      });
      // latest first
      query.orderBy("timestamp", "desc");
      const propertyData = await query.exec();

      // console.log("propertyData", propertyData);

      if (!propertyData.length) {
        return response.status(404).send({ message: "No data found for given properties" });
      }

      const properties = propertyData.map((value) => {
        const temp = value.gensetPropertyId;
        // console.log(temp);
      });
      // console.log("properties, ", properties);

      const label = propertyData[0].gensetProperty?.readablePropertyName || "?";
      const xs = propertyData.map((value) => DateTime.fromJSDate(value.timestamp).toFormat("dd-MM"));
      const ys = propertyData.map((value) => value.propertyValue);
      // console.log("ys array:", ys);

      const generateTypstBarChart = (xs: string[], ys: number[], label: string) => {
        return `
    #let xs = (${xs.map((v) => `"${v}"`).join(", ")})
    #let ys = (${ys.join(", ")})
    
    // #set align(right)
    #lq.diagram(
      xaxis: (
        ticks: xs .map(rotate.with(-45deg, reflow: true))
      .map(align.with(right)).enumerate(),
      ),
  
      lq.bar(range(${ys.length}), ys, label: ["${label}"])
    )
  `;
      };

  
    

  

      const data = await request.validateUsing(getAnomalyStatisticsValidator);
      const timezone = request.header("timezone");
      const result = await ArchiveService.getAnomalyStatistics(timezone);
      //  console.log("result result", result);
      const overallAnomaly = result.overall;
      // console.log(typeof result);

      const xsl = Object.entries(result.overall).map(([key, _]) => key);
      const ysl = Object.entries(result.overall).map(([_, value]) => value);

      const generateAnomalyBarChart = (xsl: object[], ysl: object[]) => {
        // console.log("xs", xsl);
        // console.log("ys", ysl); // [0, 0, 0, 144]
        return `
        
    #let xsl = (${xsl.map((v) => `"${v}"`).join(", ")})
    #let ysl = (${ysl.join(", ")})
    
    #box(width: 50%, height: 0pt)[
    #set align(top + left)
    #lq.diagram(
      xaxis: (
        ticks: xsl .map(rotate.with(-45deg, reflow: true))
      .map(align.with(right)).enumerate(),
      ),
      lq.bar(range(${ysl.length}), ysl)
      )]
  `;
      };

      const dataTuple = result.byProperty.map((prop) => `("${prop.readablePropertyName}", ${prop.total})`).join(",\n  ");
      // console.log("dataTuple", dataTuple);
      // console.log(typeof dataTuple);
      const generatePieChart = (dataTuple) => {
        // console.log("dataTuplr", dataTuple);

        return `
          
#let data = (
  ${dataTuple}
)
#box(width: 100%, height: 220pt)[
#set align(top + right)
#cetz.canvas({
  let colors = gradient.linear(red, blue, green, yellow)

  chart.piechart(
    data,
    value-key: 1,
     label-key: 0,
    radius: 3,
    outset-key: none,
    slice-style: colors,
    inner-radius: 0.1,
    outset: 4,
    //outer-label.content: "LABEL",
      outer-label: (content: (value, label) => [#text(white, str(value))], radius: 110%, layout: "vertical",),
     
     inner-label: (content: (value, label) => [#text(white, str(value))], radius: 110%)
  )
      })]
`;
      };

      const typstDoc =
        typstBase + generateAnomalyBarChart(xsl, ysl) + generatePieChart(dataTuple) + generateTypstBarChart(xs, ys, label);
      //  + pieChart;
      // console.log(typstDoc);

      await fs.writeFile(tmpFile, typstDoc);
      const pdfBuffer = await compilePdf(tmpFile);
      response.header("Content-Type", "application/pdf");
      response.header("Content-Disposition", "attachment; filename=report.pdf");
      // serve the compiled pdf
      return response.send(pdfBuffer);
      // delete the temporary typst file (?)
    } catch (err) {
      // await fs.unlink(tmpFile).catch(console.error);
      console.error("Error:", err);
      return response.status(500).send(err);
    }
  }
}
