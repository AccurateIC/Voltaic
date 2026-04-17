import type { HttpContext } from "@adonisjs/core/http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import Archive from "#models/archive";
import logger from "@adonisjs/core/services/logger";
import { DateTime } from "luxon";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

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

= Swarnim Barapatre

// personal info
#pad(top: 0.25em, align(center)[
  +91 8149 833 469 |
  Pune |
  #link("mailto:swarnim335@gmail.com") |
  #link("https://github.com/swarnimcodes/")[github/swarnimcodes] |
  #link(
    "https://www.linkedin.com/in/swarnimbarapatre/",
  )[linkedin/swarnimbarapatre]
])


#lq.diagram(
  lq.plot(
  (0, 1, 2, 3, 4),
  (5, 4, 2, 1, 2)
))


#lq.diagram(
  xaxis: (
    ticks: ("Apples", "Bananas", "Kiwis", "Mangos", "Papayas")
      .map(rotate.with(-45deg, reflow: true))
      .map(align.with(right))
      .enumerate(),
    subticks: none,
  ),
  lq.bar(
    range(5),
    (5, 3, 4, 2, 1),
  )
)
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
     await fs.unlink(tmpFile).catch((err) => {
  logger.error({ err, tmpFile }, "Failed to delete temporary typst file");
});
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
  async generateDummy({ response }: HttpContext) {
    // make a temporary typst file with .typ extension
    const tmpFile = path.join(dirname, "report.typ");
    try {
      const reusableData = await this.getData();
     logger.info({ reusableData }, "Fetched reusable report data");
      // add data from db to typst doc
      const query = Archive.query();

      // filter by property names
      query.whereHas("gensetProperty", (propertyQuery) => {
        propertyQuery.whereIn("propertyName", ["engOilPress"]);
      });

      // preload
      query.preload("gensetProperty", (preloadQuery) => {
        preloadQuery.preload("physicalQuantity");
      });

      // latest first
      query.orderBy("timestamp", "desc");

      const propertyData = await query.exec();

      // const xs = propertyData.map((value, index) => DateTime.fromJSDate(value.timestamp));

      const xs = propertyData.map((value) => DateTime.fromJSDate(value.timestamp.toJSDate()).toMillis());
      const ys = propertyData.map((value) => value.propertyValue);

      // console.log(xs);
      // console.log(ys);

      const generateTypstBarChart = (xValues: string[] | number[], yValues: number[]) => {
        return `
        #let xs = ( ${xValues.map((value) => value).join(", ")} )
        #let ys = ( ${yValues.map((value) => `${value}`).join(", ")} )

        #lq.diagram(
          lq.bar(xs, ys, label: [Engine Oil Pressure])
        )
     `;
      };

      const typstDoc = typstBase + generateTypstBarChart(xs, ys);
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
      logger.error({ err }, "Error generating dummy report");
      return response.status(500).send(err);
    }
  }
}
