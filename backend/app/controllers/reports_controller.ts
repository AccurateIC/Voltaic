import type { HttpContext } from "@adonisjs/core/http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "url";

import { spawn } from "node:child_process";
import Archive from "#models/archive";
import {  getAnomalyStatisticsValidator } from "../validators/archive.js";
import { DateTime } from "luxon";
import { ArchiveService } from "#services/archive_service";
import { argv } from "node:process";

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
 #set text(font: "New Computer Modern", size: 11pt, lang: "en", ligatures: false)

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
    
 const requestBody = request.body();
 console.log("requestBody", requestBody);
 const selectedPropertyNames = requestBody.properties || []
 console.log("selectedPropertyNames", selectedPropertyNames);


  const propertyStats = (
      await Archive.query()
       .whereHas("gensetProperty", (query) => {
      query.whereIn("propertyName", selectedPropertyNames)
    })
        .preload("gensetProperty")  // "Also fetch the related gensetProperty data along with each archive entry."
        .select("gensetPropertyId")
        .groupBy("gensetPropertyId")
    ).map((value) => ({
      readablePropertyName: value.gensetProperty.readablePropertyName,
      gensetPropertyId: value.gensetPropertyId,
      propertyName: value.gensetProperty.propertyName,
    }));

    console.log("propertyStats", propertyStats);
          
const resultData = await ArchiveService.getPropertyStatistics({ request });
const durationTime = resultData?.meta.timeDuration;

function getWeekRange(week: number, month: number, year: number) {
  const start = DateTime.fromObject({ weekYear: year, weekNumber: week, weekday: 1 });
  return { start, end: start.endOf("week") };
}

console.log("resultData", resultData);
// Group data by genset_property_id
const groupedData = resultData.data.reduce<Record<number, typeof resultData.data>>((acc, entry) => {
  const key = entry.genset_property_id;
  (acc[key] ||= []).push(entry); // shorthand for if (!acc[key]) acc[key] = []
  return acc;
}, {});

// Typst chart generator
const generateTypstBarChart = (title: string , xs: string[], ys: number[]) => `
#let xs = (${xs.map(v => `"${v}"`).join(", ")})
#let ys = (${ys.join(", ")})


// #set align(center)
#lq.diagram(
  width: 7cm,
  height: 6cm,
  legend: (position: left + top),
  xaxis: (
    ticks: xs
      .map(rotate.with(-45deg, reflow: true))
      .map(align.with(right))
      .enumerate(),
  ),
  lq.bar(range(${ys.length}), ys, label: ["${title}"])
)
`;

// Utility to get formatted label
function formatLabel(entry: any): string {
  switch (durationTime) {
    case "year":
      return DateTime.fromObject({ year: entry.year, month: entry.month, day: 1 }).toFormat("LLL");
    case "month": {
      const { start, end } = getWeekRange(entry.week, entry.month, entry.year);
      return `${start.toFormat("MMM d")} - ${end.toFormat("MMM d")}`;
    }
    case "week":
      return DateTime.fromObject({ day: entry.day, month: entry.month, year: entry.year }).toFormat("ccc LLL dd");
    default:
      return "";
  }
}

// Generate all charts
let allChartsTypstCode = "";
// for (const entries of Object.values(groupedData)) {
  
//   const xs = entries.map(formatLabel);
//   const ys = entries.map(entry => entry.avg);
//   allChartsTypstCode += generateTypstBarChart(xs, ys);
// }

console.log("groupedData", groupedData);
for (const [propertyIdStr, entries] of Object.entries(groupedData)) {
  if (!Array.isArray(entries)) {
    console.warn("Skipping non-array entry:", entries);
    continue;
  }

  const xs = entries.map(formatLabel);
  const ys = entries.map(entry => entry.avg);

  const propertyId = Number(propertyIdStr);
  console.log("propertyId", propertyId);
  const matched = propertyStats.find(p => p.gensetPropertyId === propertyId);
  if (!matched) continue;

  const title = matched.readablePropertyName;
  console.log(typeof(title));
  console.log("props", xs, ys, title);
  allChartsTypstCode += generateTypstBarChart(title, xs, ys);
}



      // ✅ This is your full final Typst chart code:

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
          Anomaly Count
    #let xsl = (${xsl.map((v) => `"${v}"`).join(", ")})
    #let ysl = (${ysl.join(", ")})
    
    // #box(width: 50%, height: 5pt)[
    //  #set align(top + left)
    #lq.diagram(
    width: 7cm,
  height: 6cm,
      xaxis: (
        ticks: xsl .map(rotate.with(-45deg, reflow: true))
      .map(align.with(right)).enumerate(),
      ),
      lq.bar(range(${ysl.length}), ysl)
      )
      // ]
  `;
      };

      const dataTuple = result.byProperty.map((prop) => `("${prop.readablePropertyName}", ${prop.total})`).join(",\n  ");

      const generatePieChart = (dataTuple) => {
        // console.log("dataTuplr", dataTuple);

        return `
            
#let data = (
  ${dataTuple}
)
// #box(width: 100%, height: 150pt)[
// #set align(top + right)
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
      })
  // ]
`;
      };

      const typstDoc = typstBase + generateAnomalyBarChart(xsl, ysl) + generatePieChart(dataTuple) + allChartsTypstCode;
      // generateTypstBarChart(xs, ys, propertyId)
      // generateTypstBarChart(xs, ys);
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
