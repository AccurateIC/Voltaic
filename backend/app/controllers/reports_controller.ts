import type { HttpContext } from "@adonisjs/core/http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "url";
import { spawn } from "node:child_process";
import Archive from "#models/archive";
import { DateTime } from "luxon";
import { ArchiveService } from "#services/archive_service";
import { PdmService } from "#services/pdm_service";
import { filteredHealthIndexData } from "./filteredHealthIndex.js";
import { RulService } from "../../app/services/rul_service.js";
import { argv } from "node:process";
import { count } from "node:console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const typstBase = `
// packages
#import "@preview/lilaq:0.2.0" as lq
#import "@preview/cetz:0.4.0"
#import "@preview/cetz-plot:0.1.2": chart

#set page(numbering: "1")
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
  = Report Document
// Name will be aligned left, bold and big
#show heading.where(level: 1): it => [
  #set align(center)
  #set text(weight: 500, si: 24pt)
  #pad([#smallcaps(it.body)])
]`;

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
    const tmpFile = path.join(__dirname, "report.typ");
    try {
      const { properties, anomaliesCount, anomaliesByProperty, pdm, rul } = request.body();
      const requestBody = request.body();
      const selectedPropertyNames = requestBody.properties || [];

      const propertyStats = (
        await Archive.query()
          .whereHas("gensetProperty", (query) => {
            query.whereIn("propertyName", selectedPropertyNames);
          })
          .preload("gensetProperty")
          .select("gensetPropertyId")
          .groupBy("gensetPropertyId")
      ).map((value) => ({
        readablePropertyName: value.gensetProperty.readablePropertyName,
        gensetPropertyId: value.gensetPropertyId,
        propertyName: value.gensetProperty.propertyName,
      }));

      const resultData = await ArchiveService.getPropertyStatistics({ request });
      const durationTime = resultData?.meta.timeDuration;
      function getWeekRange(week: number, month: number, year: number) {
        const start = DateTime.fromObject({ weekYear: year, weekNumber: week, weekday: 1 });
        return { start, end: start.endOf("week") };
      }

      const groupedData = resultData.data.reduce<Record<number, typeof resultData.data>>((acc, entry) => {
        const key = entry.genset_property_id;
        (acc[key] ||= []).push(entry);
        return acc;
      }, {});

      const generateTypstBarChart = (title: string, xs: object[], ys: object[], durationTime: string) => {
        let granularity = "";
        if (durationTime === "week") {
          granularity = "day";
        } else if (durationTime === "month") {
          granularity = "week";
        } else if (durationTime === "year") {
          granularity = "month";
        }
        return `
     
        #box(height: 8cm)[
        #grid(
        columns: (1fr, 1fr),
        inset:20pt,
        
        align(center)[
        #set align(top + center)
        *${title}  Monitor*  
        #let xs = (${xs.map((v) => `"${v}"`).join(", ")})
        #let ys = (${ys.join(", ")})

        #box(width: 80%, height: 160pt)[
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
            lq.bar(range(${ys.length}), ys, label: ["${title}"], width: 0.7)
            )
          ]
        ],

    align(center)[
      #set text(size: 14pt, weight: 300)
     Property Name: *${title}*

      This chart shows the average ${title} values recorded for the ${durationTime} duration by each ${granularity} average data.
      
    ]
      )]
     

  `;
      };

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

      let allChartsTypstCode = "";
      for (const [propertyIdStr, entries] of Object.entries(groupedData)) {
        if (!Array.isArray(entries)) {
          console.warn(`Skipping non-array entry for propertyId: ${propertyIdStr}`, {
            receivedType: typeof entries,
            value: entries,
          });
        }

        const xs = entries.map(formatLabel);
        const ys = entries.map((entry) => entry.avg);
        const propertyId = Number(propertyIdStr);
        const matched = propertyStats.find((p) => p.gensetPropertyId === propertyId);
        if (!matched) continue;

        const title = matched.readablePropertyName;
        allChartsTypstCode += generateTypstBarChart(title, xs, ys, durationTime);
      }

      const timezone = request.header("timezone");
      const result = await ArchiveService.getAnomalyStatistics(timezone);
      const xsl = Object.entries(result.overall).map(([key, _]) => key);
      const ysl = Object.entries(result.overall).map(([_, value]) => value);

      const generateAnomalyBarChart = (xsl: object[], ysl: object[]) => {
        return `
        #box(height: 9cm)[
        #grid(
        columns: (1fr, 1fr),
        inset:10pt,
        align: horizon,
          [
          #set align(top + center)
         == Anomaly count 

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
          ],
          align(center)[
          
          #box(inset: (top: 1pt,  right: 70pt))[
          #set align(left)
          #set text(weight: 150, size: 14pt)
         
          #let xsl = (${xsl.map((v) => `"${v}"`).join(", ")})
          #let ysl = (${ysl.join(", ")})
          - Anomaly by Time Duration
           #for i in range(xsl.len()) [
            - #xsl.at(i)'s Anomalies : #ysl.at(i) \\
           ]
          ]
           ]
      )]`;
      };

      const propertynm = result.byProperty.map((item) => item.readablePropertyName);
      const totalAnomaly = result.byProperty.map((item) => item.total);

      const generatePropertyAnomalyChart = (propertynm, totalAnomaly) => {
        return `
            #let xsl = (${propertynm.map((v) => `"${v}"`).join(", ")})
            #let ysl = (${totalAnomaly.join(", ")})
            
            #box(height: 8.7cm)[
            #grid(
            columns: (1fr, 1fr),
            inset: -12pt,
            align: horizon,
            [
            #set align(top + center)
            == Anomaly By Property

            #lq.diagram(
            width: 7cm,
            height: 6cm,
            xaxis: (
            ticks: xsl.map(rotate.with(-45deg, reflow: true)).map(align.with(right)).enumerate(),
            ),
            lq.bar(range(${totalAnomaly.length}), ysl)
            )
           ],
           align(center)[
           #box(inset: (bottom: 90pt, right: 70pt))[
           #set align(left)
           #set text(weight: 150, size: 12pt)
           - Total anomalies of properties
           #for i in range(xsl.len()) [
      
            - #xsl.at(i) : #ysl.at(i) \\
        
          ] 
         ]
         ]
      )]`;
      };

      const pdmData = await PdmService.maintenanceNotificationStatistics({ request });
      const counts = pdmData.data.map((entry) => Number(entry.count));
      const xs = pdmData.data.map(formatLabel);

      const generatePDMBarChart = (xs: object[], counts: object[]) => {
        return `
           #let xs = (${xs.map((v) => `"${v}"`).join(", ")})
           #let count = (${counts.join(", ")})
           #box(height: 8cm)[
           #grid(
           columns: (1fr, 1fr),
           inset:10pt,
           align: horizon,
           [
           #set align(top + center)
           == PDM Notification Graph
           // #box(width: 50%, height: 5pt)[
           //  #set align(top + left)
           #lq.diagram(
            width: 7cm,
            height: 6cm,
            xaxis: (
                    ticks: xs.map(rotate.with(-45deg, reflow: true))
                    .map(align.with(right)).enumerate(),
                    ),
          
            lq.bar(range(${counts.length}), count)
             )
          ],
          align(center)[
          #box(inset: (top: 1pt,  right: 70pt))[
          #set align(left)
          #set text(weight: 150, size: 14pt)
         
          // #let xsl = (${xsl.map((v) => `"${v}"`).join(", ")})
          // #let ysl = (${ysl.join(", ")})
          // - Anomaly by Time Duration
          //  #for i in range(xsl.len()) [
          //   - #xsl.at(i)'s Anomalies : #ysl.at(i) 
             Numder of PDM alerts forecasted by ML model  
          //  ]
          ]
          ]
      )
          ]`;
      };

      const rulPrediction = await RulService.fetchPrediction({ request });
      const predictiveHealthIndex = rulPrediction.Future_Predictions.map((data) => data.Predicted_Health_Index);
      const timeHours = rulPrediction.Future_Predictions.map((data) => data.Time_Hours);
      const xs2 = filteredHealthIndexData.map((d) => d.Time_Hours);
      const ys2 = filteredHealthIndexData.map((d) => d.Predicted_Health_Index);

      const rulLineChart = (timeHours: number[], predictiveHealthIndex: number[]) => {
        return `
            #let xs = (${timeHours.join(", ")})
            #let ys = (${predictiveHealthIndex.join(", ")})
            #let xs1 = (${xs2.join(", ")})
            #let ys1 = (${ys2.join(", ")})
            #box(height: 8cm)[
            #grid(
            columns: (1fr, 1fr),
            inset:10pt,
            align: horizon,
            [
            #set align(top + center)
            == RUL Predictions
            #lq.diagram(
            width: 7cm,
            height: 6cm,

            xlabel: [Time (Hours)], 
            ylabel: [Predicted Health Index],

            lq.plot(xs, ys, mark: "o", label: [Predicted Health Index]),
            lq.plot( xs1,  ys1, mark: "s", label: [Health Index Trends ])
            )
            ],
            align(center)[
             #box(inset: (top: 1pt,  right: 70pt))[
            #set align(left)
            #set text(weight: 150, size: 14pt)
           This graph shows the Health Index Trend with calculated Remaining Useful Life (RUL) at the current point, alongside a Simulated Health Index curve predicting future deterioration until the failure threshold is reached.
            ]
            ]
        )
          ]`;
      };

      let typstDoc = typstBase;

      if (anomaliesCount) {
        typstDoc += generateAnomalyBarChart(xsl, ysl);
      }

      if (anomaliesByProperty) {
        typstDoc += generatePropertyAnomalyChart(propertynm, totalAnomaly);
      }

      if (allChartsTypstCode) typstDoc += allChartsTypstCode;

      if (pdm) {
        typstDoc += generatePDMBarChart(xs, counts);
      }

      if (rul) {
        typstDoc += rulLineChart(timeHours, predictiveHealthIndex);
      }

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
