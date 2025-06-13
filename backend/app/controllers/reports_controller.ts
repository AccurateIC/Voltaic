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

// = Swarnim Barapatre

// // personal info
// #pad(top: 0.25em, align(center)[
//   +91 8149 833 469 |
//   Pune |
//   #link("mailto:swarnim335@gmail.com") |
//   #link("https://github.com/swarnimcodes/")[github/swarnimcodes] |
//   #link(
//     "https://www.linkedin.com/in/swarnimbarapatre/",
//   )[linkedin/swarnimbarapatre]
// ])


// #lq.diagram(
//   lq.plot(
//   (0, 1, 2, 3, 4),
//   (5, 4, 2, 1, 2)
// ))


// #lq.diagram(
//   xaxis: (
//     ticks: ("Apples", "Bananas", "Kiwis", "Mangos", "Papayas")
//       .map(rotate.with(-45deg, reflow: true))
//       .map(align.with(right))
//       .enumerate(),
//     subticks: none,
//   ),
//   lq.bar(
//     range(5),
//     (5, 3, 4, 2, 1),
//   )
// )
//   #lq.diagram(
//   xaxis: (
//     ticks: ("Oil ", "Speed", "Voltage", "Current")
    
//     .enumerate(),
//   subticks: none,
// ),
// lq.bar(range(4),
// (5,4,2,1)
// )
// )
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
      const reusableData = await request.validateUsing(getPdfPropertyBetweenValidator);
       console.log("reusableData, ", reusableData);
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
      console.log("propertyData,propertyData", propertyData);
      // propertyData.forEach((data) => {
      //   console.log({
      //     timestamp: data.timestamp,
      //     value: data.propertyValue,
      //     property: data.gensetProperty?.propertyName,
      //   });
      // });

      if (!propertyData.length) {
        return response.status(404).send({ message: "No data found for given properties" });
      }

      const label = propertyData[0].gensetProperty?.readablePropertyName || "?";
      const xs = propertyData.map((value) => DateTime.fromJSDate(value.timestamp).toFormat("dd-MM"));
      const ys = propertyData.map((value) => value.propertyValue);
      // console.log("ys array:", ys);

      const generateTypstBarChart = (xs: string[], ys: number[], label: string) => {
        return `
    #let xs = (${xs.map((v) => `"${v}"`).join(", ")})
    #let ys = (${ys.join(", ")})
    
    #lq.diagram(
      xaxis: (
        ticks: xs .map(rotate.with(-45deg, reflow: true))
      .map(align.with(right)).enumerate(),
      ),
  
      lq.bar(range(${ys.length}), ys, label: ["${label}"])
    )
  `;
      };

      const typstDoc = typstBase + generateTypstBarChart(xs, ys, label);
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

  async getAnomalyStatistics({ request, response }: HttpContext) {
    const data = await request.validateUsing(getAnomalyStatisticsValidator);
    const timezone = request.header("timezone");

    if (!timezone) {
      return response.status(400).json({
        error: "Timezone header is required",
        message: "Please provide a valid IANA timezone identifier in the request headers",
      });
    }

    try {
      const result = await ArchiveService.getAnomalyStatistics(timezone);
      return response.ok(result);
    } catch (error) {
      return response.status(400).json({
        error: "Invalid timezone",
        message: `'${timezone}' is not a valid IANA timezone identifier`,
        details: error.message,
      });
    }
  }


 async getPropertyStatistic({ request, response }: HttpContext) {
    const data = await request.validateUsing(getAnomalyStatisticsValidator);
    const timezone = request.header("timezone");
    const tmpFile = path.join(__dirname, "report.typ");
    try {
      const result = await ArchiveService.getAnomalyStatistics(timezone);
      const overallAnomaly = result.overall;
      console.log(overallAnomaly);

      const xs = Object.entries(result.overall).map(([key, _]) => key);
      const ys = Object.entries(result.overall).map(([_, value]) => value);

      const generateAnomalyBarChart = (xs: object[], ys: object[]) => {
        console.log(xs);
        console.log("ys", ys); // [0, 0, 0, 144]
        return `
        
    #let xs = (${xs.map((v) => `"${v}"`).join(", ")})
    #let ys = (${ys.join(", ")})
    
    #lq.diagram(
      xaxis: (
        ticks: xs .map(rotate.with(-45deg, reflow: true))
      .map(align.with(right)).enumerate(),
      ),
  
      lq.bar(range(${ys.length}), ys)
    )
  `;
      };

      const typstDoc = typstBase + generateAnomalyBarChart(xs, ys);
      await fs.writeFile(tmpFile, typstDoc);
      const pdfBuffer = await compilePdf(tmpFile);
      response.header("Content-Type", "application/pdf");
      response.header("Content-Disposition", "attachment; filename=report.pdf");
      // serve the compiled pdf
      return response.send(pdfBuffer);

      return response.ok(result.overall);
    } catch (error) {
      return response.status(400).json({
        error: "Invalid timezone",
        message: `'${timezone}' is not a valid IANA timezone identifier`,
        details: error.message,
      });
    }
  }

}

