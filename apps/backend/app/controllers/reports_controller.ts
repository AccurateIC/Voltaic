import type { HttpContext } from "@adonisjs/core/http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "url";
import { spawn } from "node:child_process";
import Archive from "#models/archive";
import { DateTime } from "luxon";
import { ArchiveService } from "#services/archive_service";
import { PdmService } from "#services/pdm_service";
import { RulService } from "../../app/services/rul_service.js";
import { filteredHealthIndexData } from "./filteredHealthIndex.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const typstBase = `
#import "@preview/lilaq:0.4.0" as lq
#import "@preview/cetz:0.4.0"
#import "@preview/cetz:0.2.2"
#import "@preview/cetz-plot:0.1.2": chart

#set document(
  title: "Generator Performance Report",
  author: "NeuroGen Analytics"
)

// Page setup
#set page(
  paper: "a4",
  margin: (

    bottom: 2cm,

  ),
  header: align(right)[
    #image("logo.png", width: 20%)
  ],
  numbering: "1"
)

// Text formatting
#set text(
  font: "Liberation Sans",
  size: 11pt,
  lang: "en"
)

// Heading setup
#set heading(numbering: "1.")

// Title page
#align(center)[
  //  Push green box below the logo area
  #box(
    fill: rgb("c6efce"),
    width: 110%,
    height: 190pt,
    inset: 10pt,
    radius: 4pt
  )[
    #align(bottom)[ //  Align content to bottom inside the green box
      #text(
        "Generator Performance Report",
        size: 25pt,
        weight: "bold"
      )
    ]
  ]

  #v(0.8cm)
  #text(size: 16pt, style: "italic")[Comprehensive Analysis & Monitoring Dashboard]

  #v(0.8cm)
  #table(
    columns: 2,
    stroke: none,
    align: left,
    inset: 8pt,
    [*Report Generated:*], [#datetime.today().display()],
    [*Report Period:*], [{{TIME_PERIOD_RANGE}}],
    [*Report Type:*], [{{REPORT_TYPE}}],
  )
]


#pagebreak()

// Table of Contents
#outline(title: "Table of Contents", indent: auto)

#pagebreak()

= Summary

 #v(0.2cm)
 This {{TIME_PERIOD_TITLE}} provides detailed analysis of generator performance, Anomaly Detection results, Predictive Maintenance notifications, and Remaining Useful Life (RUL) predictions for the period {{TIME_PERIOD_RANGE}}. The data presented has been collected through Genset systems and processed using advanced machine learning algorithms.
 #v(0.5cm)

*Report Period:* {{TIME_PERIOD_RANGE}}
*Analysis Type:* {{REPORT_TYPE}}

 #v(0.1cm)

*Key Performance Indicators:*

- Anomaly detection
- Predictive maintenance
- Health index trending and RUL estimation

 #v(0.5cm)
= Report Methodology

== Data Collection

- *Data Sources:* Vibration Sensor for PDM data collection and Controller Sensor for Archive Generator Data Collection
- *Processing:* analytics with ML-based anomaly detection

 #v(0.5cm)
== Analysis Framework
- Statistical analysis of operational parameters
- Machine learning-based anomaly detection
- Predictive maintenance algorithms
- Health index calculation and trending


#pagebreak()
`;

/**
 * Compiles a Typst file to PDF and returns the PDF as a Buffer
 * @param tmpFile Path to the Typst file
 * @returns Promise resolving to a Buffer containing the PDF data
 */
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
			if (code !== 0) reject(`Compiler exited with code ${code}`);
			resolve(Buffer.concat(pdfBuffers));
		});
	});
};

export default class ReportsController {
	/**
	 * Retrieves all archive data
	 * @returns Promise resolving to an array of Archive objects
	 */
	async getData(): Promise<Archive[]> {
		const archiveData = Archive.all();
		return archiveData as Promise<Archive[]>;
	}

	/**
	 * Generates a PDF report based on the request parameters
	 * @param param0 HttpContext containing request and response objects
	 * @returns HTTP response with the generated PDF
	 */
	async generateDummy({ request, response }: HttpContext) {
		const tmpFile = path.join(__dirname, "report.typ");

		try {
			// Extract request parameters
			const { properties, anomaliesCount, anomaliesByProperty, pdm, rul } = request.body();
			const requestBody = request.body();
			const selectedPropertyNames = requestBody.properties || [];

			// Get property statistics
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

			// Get property data
			const resultData = await ArchiveService.getPropertyStatistics({ request });
			const durationTime = resultData?.meta.timeDuration;

			// Helper function to get week range
			function getWeekRange(week: number, month: number, year: number) {
				const start = DateTime.fromObject({ weekYear: year, weekNumber: week, weekday: 1 });
				return { start, end: start.endOf("week") };
			}

			// Helper function to format date labels
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

			// Function to generate time period information - modify this function
			function getTimePeriodInfo(durationTime: string, resultData: any) {
				const currentDate = new Date();
				let title = "";
				let range = "";
				let reportType = "";

				// Get actual date range from resultData if available
				const startDate = resultData?.meta?.startDate || currentDate;
				const endDate = resultData?.meta?.endDate || currentDate;

				switch (durationTime) {
					case "week":
						title = "Weekly Performance Report";
						reportType = "Weekly Performance Analysis";

						// Use actual data dates if available, otherwise calculate current week
						if (resultData?.meta?.startDate && resultData?.meta?.endDate) {
							const start = new Date(startDate);
							const end = new Date(endDate);
							range = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
						} else {
							const startOfWeek = new Date(currentDate);
							startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
							const endOfWeek = new Date(startOfWeek);
							endOfWeek.setDate(startOfWeek.getDate() + 6);
							range = `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`;
						}
						break;

					case "month":
						title = "Monthly Performance Report";
						reportType = "Monthly Performance Analysis";

						// Use actual month from data if available
						if (resultData?.meta?.month && resultData?.meta?.year) {
							const monthNames = [
								"January",
								"February",
								"March",
								"April",
								"May",
								"June",
								"July",
								"August",
								"September",
								"October",
								"November",
								"December",
							];
							range = `${monthNames[resultData.meta.month - 1]} ${resultData.meta.year}`;
						} else {
							const monthNames = [
								"January",
								"February",
								"March",
								"April",
								"May",
								"June",
								"July",
								"August",
								"September",
								"October",
								"November",
								"December",
							];
							range = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
						}
						break;

					case "year":
						title = "Annual Performance Report";
						reportType = "Annual Performance Analysis";

						// Use actual year from data if available
						if (resultData?.meta?.year) {
							range = `${resultData.meta.year}`;
						} else {
							range = `${currentDate.getFullYear()}`;
						}
						break;

					default:
						title = "Custom Performance Report";
						reportType = "Custom Performance Analysis";

						// Handle custom date ranges
						if (resultData?.meta?.startDate && resultData?.meta?.endDate) {
							const start = new Date(startDate);
							const end = new Date(endDate);
							range = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
						} else {
							range = "Custom Period";
						}
				}

				return { title, range, reportType };
			}

			// Group data by property ID
			const groupedData = resultData.data.reduce<Record<number, typeof resultData.data>>((acc, entry) => {
				const key = entry.genset_property_id;
				(acc[key] ||= []).push(entry);
				return acc;
			}, {});

			// Function to generate bar chart for property data with new layout
			const generateTypstBarChart = (
				title: string,
				xs: object[],
				ys: object[],
				durationTime: string,
				timePeriodInfo: any
			) => {
				let granularity = "";
				let description = "";

				if (durationTime === "week") {
					granularity = "daily";
					description = "This chart displays daily average values for the selected week period.";
				} else if (durationTime === "month") {
					granularity = "weekly";
					description = "This chart shows weekly average trends for the selected month period.";
				} else if (durationTime === "year") {
					granularity = "monthly";
					description = "This chart presents monthly performance trends for the selected year period.";
				}

				const average = (ys as number[]).reduce((a, b) => a + b, 0) / ys.length;
				const maximum = Math.max(...(ys as number[]));
				const minimum = Math.min(...(ys as number[]));
				const trend = (ys as number[])[ys.length - 1] > (ys as number[])[0] ? "an increasing" : "a decreasing";

				return `
        #v(0.7cm)
== ${title} Performance Analysis
#v(0.5cm)
// Centered chart with larger size
#align(center)[
  #box(width: 100%, height: 300pt)[
    #lq.diagram(
      width: 12cm,
      height: 9cm,
      legend: (position: top + right),
      xlabel: "Time Period (${granularity})",
      ylabel: "${title}",
      xaxis: (
      ticks: (${xs.map((val) => `"${val}"`).join(",")},)
          .map(rotate.with(-45deg, reflow: true))
          .map(align.with(right))
          .enumerate(),
      ),
      lq.bar(
        range(${ys.length}),
        ( ${ys.join(", ")}, ),
        label: ["${title}"],
        width: 0.7,
        fill: rgb("#2563eb")
      )
    )
  ]
]

// Description below the chart
#v(1.4cm)

#box(width: 100%)[
  #grid(
    columns: (1fr, 1fr),
    column-gutter: 20pt,

    // Left column - Parameter details
    [
      #set text(size: 11pt)

      #v(0.7cm)
      *Parameter Information*

      *Parameter:* ${title}

      *Analysis Period:* ${durationTime.charAt(0).toUpperCase() + durationTime.slice(1)}

      *Data Points:* ${ys.length} ${granularity} measurements

      *Report Period:* ${timePeriodInfo.range}

      *Description:*
      ${description} This ${timePeriodInfo.title.toLowerCase()} covers the period from ${timePeriodInfo.range}.
    ],

    // Right column - Statistics and analysis
    [
      #set text(size: 11pt)
       #v(0.7cm)
      *Statistical Analysis*

      *Key Statistics:*
      - Average: ${average.toFixed(2)}
      - Maximum: ${maximum.toFixed(2)}
      - Minimum: ${minimum.toFixed(2)}
      - Range: ${(maximum - minimum).toFixed(2)}

      *Trend Analysis:*
      The data shows ${trend} trend over the monitoring period.

      *Performance Status:*
      ${average > (maximum + minimum) / 2 ? "Above average performance" : "Below average performance"}
    ]
  )
]

#pagebreak()

`;
			};

			// Function to generate anomaly bar chart with new layout
			const generateAnomalyBarChart = (xsl: object[], ysl: object[]) => {
				const totalAnomalies = (ysl as number[]).reduce((a, b) => a + b, 0);

				return `
= Anomaly Detection Analysis

This section presents the results of machine learning-based anomaly detection algorithms applied to generator operational data.
#v(0.3cm)
== Anomaly Count
#v(0.6cm)
// Centered chart with larger size
#align(center)[
  #box(width: 100%, height: 300pt)[
    #lq.diagram(
      width: 12cm,
      height: 9cm,
      xlabel: [Time Period],
      ylabel: [Anomaly Count],
      xaxis: (
        ticks: (${xsl.map((v) => `"${v}"`).join(", ")})
          .map(rotate.with(-45deg, reflow: true))
          .map(align.with(right))
          .enumerate(),
      ),
      lq.bar(
        range(${ysl.length}),
        (${ysl.join(", ")}),
        fill: rgb("#dc2626"),
        width: 0.7
      )
    )
  ]
]

// Description below the chart
#v(1.3cm)

#box(width: 100%)[
  #grid(
    columns: (1fr, 1fr),
    column-gutter: 20pt,

    // Left column - Anomaly summary
    [
      #set text(size: 11pt)

      *Anomaly Detection Summary*

      *Total Anomalies Detected:* ${totalAnomalies}

      *Detection Method:* ML-based statistical analysis

      *Time Period Breakdown:*
      ${xsl.map((period, index) => `- ${period}: ${ysl[index]} anomalies`).join("\n      ")}

      *Analysis Method:*
      Advanced machine learning algorithms analyze patterns in operational data to identify deviations from normal operating parameters.
    ],

    // Right column - Recommendations
    [
      #set text(size: 11pt)

      *Analysis & Recommendations*

      *Critical Findings:*
      ${totalAnomalies > 10 ? "High anomaly count requires immediate attention" : "Anomaly levels within acceptable range"}

      *Immediate Actions:*
      - Investigate periods with high anomaly counts
      - Review maintenance schedules for affected systems
      - Monitor trending patterns for preventive action

      *Long-term Strategy:*
      - Implement enhanced monitoring protocols
      - Optimize detection algorithms
      - Establish anomaly response procedures
    ]
  )
]

#pagebreak()

`;
			};

			// Function to generate property anomaly chart with new layout
			const generatePropertyAnomalyChart = (propertynm, totalAnomaly) => {
				return `
== Anomaly Distribution by Property
#v(0.5cm)
// Centered chart with larger size
#align(center)[
  #box(width: 100%, height: 400pt)[
    #lq.diagram(
      width: 12cm,
      height: 9cm,
      xlabel: [Generator Properties],
      ylabel: [Total Anomalies],
      xaxis: (
        ticks: (${propertynm.map((v) => `"${v}"`).join(", ")})
          .map(rotate.with(-45deg, reflow: true))
          .map(align.with(right))
          .enumerate(),
      ),
      lq.bar(
        range(${totalAnomaly.length}),
        (${totalAnomaly.join(", ")}),
        fill: rgb("#dc2626"),
        width: 0.7
      )
    )
  ]
]

// Description below the chart
#v(1cm)

#box(width: 100%)[
  #grid(
    columns: (1fr, 1fr),
    column-gutter: 20pt,

    // Left column - Property analysis
    [
      #set text(size: 11pt)

      *Property-wise Analysis*

      *Properties Monitored:* ${propertynm.length}

      *Anomaly Distribution:*
      ${propertynm.map((prop, index) => `- ${prop}: ${totalAnomaly[index]} anomalies`).join("\n      ")}

      *Critical Properties:*
      Properties with highest anomaly counts require immediate attention and may indicate equipment issues.
    ],

    // Right column - Action items
    [
      #set text(size: 11pt)

      *Action Items & Recommendations*

      *Immediate Actions:*
      - Focus maintenance on high-anomaly properties
      - Verify sensor accuracy and calibration
      - Implement enhanced monitoring protocols

      *Root Cause Analysis:*
      - Sensor calibration issues
      - Equipment degradation
      - Operational stress conditions

      *Prevention Measures:*
      - Regular sensor maintenance
      - Predictive maintenance scheduling
      - Performance threshold monitoring
    ]
  )
]

#pagebreak()

`;
			};

			// Function to generate PDM bar chart with new layout
			const generatePDMBarChart = (xs: object[], counts: object[]) => {
				const totalNotifications = (counts as number[]).reduce((a, b) => a + b, 0);

				return `
= Predictive Maintenance Analysis

This section presents predictive maintenance notifications generated by machine learning algorithms analyzing equipment condition and performance trends.

// Centered chart with larger size
#align(center)[
  #box(width: 100%, height: 300pt)[
    #lq.diagram(
      width: 12cm,
      height: 9cm,
      xlabel: [Time Period],
      ylabel: [Maintenance Notifications],
      xaxis: (
        ticks: (${xs.map((v) => `"${v}"`).join(", ")},)
          .map(rotate.with(-45deg, reflow: true))
          .map(align.with(right))
          .enumerate(),
      ),
      lq.bar(
        range(${counts.length}),
        (${counts.join(", ")},),
        fill: rgb("#7c3aed"),
        width: 0.7
      )
    )
  ]
]

// Description below the chart
#v(1cm)

#box(width: 100%)[
  #grid(
    columns: (1fr, 1fr),
    column-gutter: 20pt,

    // Left column - PDM summary
    [
      #set text(size: 11pt)

      *Predictive Maintenance Summary*

      *Total Notifications:* ${totalNotifications}

      *Prediction Model:* Advanced ML algorithms

      *Notification Types:*
      - Scheduled maintenance reminders
      - Condition-based alerts
      - Performance degradation warnings

      *Model Benefits:*
      Predictive maintenance reduces unplanned downtime and optimizes maintenance scheduling.
    ],

    // Right column - Benefits and actions
    [
      #set text(size: 11pt)

      *Benefits & Next Actions*

      *Key Benefits:*
      - Reduced unplanned downtime
      - Optimized maintenance scheduling
      - Extended equipment lifespan
      - Cost-effective operations

      *Immediate Actions:*
      Review and schedule recommended maintenance activities based on ML predictions.

      *Long-term Strategy:*
      - Implement condition-based maintenance
      - Optimize maintenance intervals
      - Track maintenance effectiveness
    ]
  )
]

#pagebreak()

`;
			};

			// Function to generate RUL line chart with new layout
			const rulLineChart = (timeHours: number[], predictiveHealthIndex: number[]) => {
				const currentHealthIndex = filteredHealthIndexData[filteredHealthIndexData.length - 1]?.Predicted_Health_Index || 0;
				console.log("currentHealthIndex", currentHealthIndex);
				const predictedHealthIndex = predictiveHealthIndex[predictiveHealthIndex.length - 1] || 0;
				console.log("predictedHealthIndex", predictedHealthIndex);
				const maxHours = Math.max(...timeHours);

				let historicalPlotContent = "";
				if (filteredHealthIndexData.length > 0) {
					historicalPlotContent = `
            lq.plot(
              (${filteredHealthIndexData.map((d) => d.Time_Hours).join(", ")}),
              (${filteredHealthIndexData.map((d) => d.Predicted_Health_Index).join(", ")}),
              mark: "o",
              label: [Health Index Trend],
              stroke: rgb("#059669")
            ),
          `;
				}

				let rulPlotContent = "";
				if (timeHours.length > 0 && predictiveHealthIndex.length > 0) {
					rulPlotContent = `
            lq.plot(
              (${timeHours.join(", ")}),
              (${predictiveHealthIndex.join(", ")}),
              mark: "s",
              label: [Current Health Index],
              stroke: rgb("#dc2626")
            ),
          `;
				}

				const failureThresholdPlot = `
 lq.plot(
  (0, 10000),
  (0.2, 0.2),
  label: [Failure Threshold],
  stroke: rgb("#991b1b")
      )


`;
				let diagramContent = "";
				if (historicalPlotContent || rulPlotContent) {
					// Generate desired X-axis ticks (1000, 2000, ..., 10000)
					// console.log("rulPlotContent",rulPlotContent);
					const desiredRULTicks = [];
					for (let i = 0; i <= 10000; i += 1000) {
						desiredRULTicks.push(i);
					}
					const typstRULTicksLiteral = `(${desiredRULTicks.map((t) => t.toString()).join(", ")})`;

					diagramContent = `
            #let rul_x_ticks = ${typstRULTicksLiteral} // Define Typst variable for RUL X-axis ticks
            #lq.diagram(
              width: 12cm,
              height: 9cm,
              legend: (position: top + right),
              xlabel: [Time (Hours)],
              ylabel: [Health Index],
              xaxis: (
                ticks: rul_x_ticks, // Use the generated RUL ticks
                // You might also want to add grid lines at these ticks:
                // grid: true,
              ),
              ${historicalPlotContent}
              ${rulPlotContent}
              ${failureThresholdPlot}
            )
          `;
				} else {
					diagramContent = `#align(center)[#text(size: 14pt, fill: red)[No RUL prediction data available.]]`;
				}

				return `
= Remaining Useful Life (RUL) Prediction

This section provides advanced analytics on equipment health trends and remaining useful life predictions using machine learning models.

// Centered chart with larger size
#align(center)[
  #box(width: 100%, height: 300pt)[
    ${diagramContent}
  ]
]

// Description below the chart
#v(1cm)

#box(width: 100%)[
  #grid(
    columns: (1fr, 1fr),
    column-gutter: 20pt,

    // Left column - RUL analysis
    [
      #set text(size: 11pt)

      *RUL Analysis Summary*

      *Current Health Index:* ${currentHealthIndex.toFixed(2)}

      *Predicted Health Index :* ${predictedHealthIndex.toFixed(2)}

      *Prediction Horizon:* ${maxHours} hours

      *Model Accuracy:* High confidence ML prediction


    ],

    // Right column - Recommendations
    [
      #set text(size: 11pt)

      *Recommendations & Actions*

      *Immediate Actions:*
      - Monitor health index trends closely
      - Plan maintenance before critical threshold
      - Consider component replacement timing
      - Optimize operational parameters

      *Strategic Planning:*
      - Develop replacement schedules
      - Budget for component replacements
      - Implement condition monitoring
      - Track degradation patterns

      *Risk Assessment:*
      ${currentHealthIndex.toFixed(2) < 0.4 ? "Critical - Immediate action required" : currentHealthIndex.toFixed(2) < 0.6 ? "Moderate - Plan maintenance soon" : "Low - Continue monitoring"}
    ]
  )
]

#pagebreak()

`;
			};

			// Get data from services
			const timezone = request.header("timezone");
			const anomalyResult = await ArchiveService.getAnomalyStatistics(timezone);
			const pdmData = await PdmService.maintenanceNotificationStatistics({ request });
			const rulPrediction = await RulService.fetchPrediction({ request });

			const xsl = Object.entries(anomalyResult.overall).map(([key, _]) => key);
			const ysl = Object.entries(anomalyResult.overall).map(([_, value]) => value);
			const propertynm = anomalyResult.byProperty.map((item) => item.readablePropertyName);
			const totalAnomaly = anomalyResult.byProperty.map((item) => item.total);

			const counts = pdmData.data.map((entry) => Number(entry.count));
			const xs = pdmData.data.map(formatLabel);

			const predictiveHealthIndex = rulPrediction.Future_Predictions.map((data) => data.Predicted_Health_Index);
			const timeHours = rulPrediction.Future_Predictions.map((data) => data.Time_Hours);

			// After getting the time period info, replace the template placeholders:
			// Get time period information
			const timePeriodInfo = getTimePeriodInfo(durationTime, resultData);
			// Generate property charts
			let allChartsTypstCode = ""; // Initialize here, outside the loop
			if (Object.keys(groupedData).length > 0) {
				allChartsTypstCode += `
= Generator Performance Metrics

This section provides detailed analysis of key generator performance parameters monitored during the reporting period. Each chart represents statistical analysis of sensor data collected at regular intervals.


`;

				for (const [propertyIdStr, entries] of Object.entries(groupedData)) {
					if (!Array.isArray(entries)) {
						console.warn(`Skipping non-array entry for propertyId: ${propertyIdStr}`);
						continue;
					}

					const xs = entries.map(formatLabel);
					const ys = entries.map((entry) => entry.avg);
					const propertyId = Number(propertyIdStr);
					const matched = propertyStats.find((p) => p.gensetPropertyId === propertyId);

					if (!matched) continue;

					const title = matched.readablePropertyName;
					allChartsTypstCode += generateTypstBarChart(title, xs, ys, durationTime, timePeriodInfo);
				}
			}

			// Build the complete document with time period information - REPLACE ALL PLACEHOLDERS
			let typstDoc = typstBase
				.replace(/\{\{TIME_PERIOD_TITLE\}\}/g, timePeriodInfo.title)
				.replace(/\{\{TIME_PERIOD_RANGE\}\}/g, timePeriodInfo.range)
				.replace(/\{\{REPORT_TYPE\}\}/g, timePeriodInfo.reportType);

			if (anomaliesCount) {
				typstDoc += generateAnomalyBarChart(xsl, ysl);
			}

			if (anomaliesByProperty) {
				typstDoc += generatePropertyAnomalyChart(propertynm, totalAnomaly);
			}

			// Declare the variable before using it

			if (allChartsTypstCode) {
				typstDoc += allChartsTypstCode;
			}

			if (pdm) {
				typstDoc += generatePDMBarChart(xs, counts);
			}

			if (rul) {
				typstDoc += rulLineChart(timeHours, predictiveHealthIndex);
			}

			// Add conclusion
			typstDoc += `
= Conclusions and Recommendations

== Summary
This comprehensive analysis of generator performance data provides valuable insights into:
- Operational efficiency and parameter stability
- Anomaly patterns and frequency
- Predictive maintenance requirements
- Equipment health trends and remaining useful life

== Key Findings
- Generator performance metrics are within acceptable operational ranges
- Anomaly detection algorithms have identified areas requiring attention
- Predictive maintenance scheduling can optimize operational efficiency
- Health index trending provides early warning of potential issues

== Action Items
1. *Immediate Actions:*
   - Address high-priority anomalies identified in the analysis
   - Schedule maintenance activities as recommended by PDM algorithms

2. *Short-term Planning:*
   - Implement enhanced monitoring for critical parameters
   - Optimize operational procedures based on performance data

3. *Long-term Strategy:*
   - Plan equipment replacement based on RUL predictions
   - Develop preventive maintenance schedules
   - Invest in advanced monitoring technologies

// == Next Steps
// - Review this report with maintenance and operations teams
// - Implement recommended actions and schedule follow-up analysis
// - Continue monitoring and data collection for ongoing optimization

// ---

// #align(center)[
//   #text(size: 10pt, style: "italic")[
//     Report generated by NeuroGen Analytics Platform

//     For technical support or questions, contact the analytics team.
//   ]
// ]
`;

			// Write the Typst document to a file and compile it
			await fs.writeFile(tmpFile, typstDoc);
			const pdfBuffer = await compilePdf(tmpFile);

			// Send the PDF as a response
			response.header("Content-Type", "application/pdf");
			response.header("Content-Disposition", "attachment; filename=generator-report.pdf");
			response.send(pdfBuffer);
		} catch (error) {
			console.error("Error:", error);
			response.status(500).send("An error occurred while generating the report.");
		}
	}
// =======
// import { fileURLToPath } from "node:url";
// import { spawn } from "node:child_process";
// import Archive from "#models/archive";

// import { DateTime } from "luxon";

// const filename = fileURLToPath(import.meta.url);
// const dirname = path.dirname(filename);

// const typstBase = `
// // packages
// #import "@preview/lilaq:0.2.0" as lq

// // set doc metadata
// #set document(author: "NeuroGen", title: "NeuroGen Report")

// // font style
// #set text(font: "New Computer Modern", size: 10pt, lang: "en", ligatures: false)

// // page properties
// #set page(margin: 0.5in, paper: "a4")


// // Small caps for section titles
// #show heading.where(level: 2): it => [
//   #pad(top: 0pt, bottom: -10pt, [#smallcaps(it.body)])
//   #line(length: 100%, stroke: 0.1pt)
// ]

// // Name will be aligned left, bold and big
// #show heading.where(level: 1): it => [
//   #set align(center)
//   #set text(weight: 500, size: 24pt)
//   #pad([#smallcaps(it.body)])
// ]

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
// `;

// const compilePdf = (tmpFile: string): Promise<Buffer> => {
//   return new Promise((resolve, reject) => {
//     const compileProc = spawn("typst", ["compile", tmpFile, "-"]);
//     const pdfBuffers: Buffer[] = [];

//     compileProc.stdout.on("data", (chunk) => {
//       pdfBuffers.push(chunk);
//     });

//     compileProc.stderr.on("data", (data) => {
//       reject(data.toString());
//     });

//     compileProc.on("close", async (code) => {
//       await fs.unlink(tmpFile).catch(console.error);
//       if (code !== 0) reject(`Compiler exited with code ${code}`);
//       resolve(Buffer.concat(pdfBuffers));
//     });
//   });
// };

// export default class ReportsController {
//   async getData(): Promise<Archive[]> {
//     const archiveData = Archive.all();
//     return archiveData as Promise<Archive[]>;
//   }
//   async generateDummy({ response }: HttpContext) {
//     // make a temporary typst file with .typ extension
//     const tmpFile = path.join(dirname, "report.typ");
//     try {
//       const reusableData = await this.getData();
//       console.log(reusableData);
//       // add data from db to typst doc
//       const query = Archive.query();

//       // filter by property names
//       query.whereHas("gensetProperty", (propertyQuery) => {
//         propertyQuery.whereIn("propertyName", ["engOilPress"]);
//       });

//       // preload
//       query.preload("gensetProperty", (preloadQuery) => {
//         preloadQuery.preload("physicalQuantity");
//       });

//       // latest first
//       query.orderBy("timestamp", "desc");

//       const propertyData = await query.exec();

//       // const xs = propertyData.map((value, index) => DateTime.fromJSDate(value.timestamp));

//       const xs = propertyData.map((value) => DateTime.fromJSDate(value.timestamp.toJSDate()).toMillis());
//       const ys = propertyData.map((value) => value.propertyValue);

//       // console.log(xs);
//       // console.log(ys);

//       const generateTypstBarChart = (xValues: string[] | number[], yValues: number[]) => {
//         return `
//         #let xs = ( ${xValues.map((value) => value).join(", ")} )
//         #let ys = ( ${yValues.map((value) => `${value}`).join(", ")} )

//         #lq.diagram(
//           lq.bar(xs, ys, label: [Engine Oil Pressure])
//         )
//      `;
//       };

//       const typstDoc = typstBase + generateTypstBarChart(xs, ys);
//       // console.log(typstDoc);

//       await fs.writeFile(tmpFile, typstDoc);
//       const pdfBuffer = await compilePdf(tmpFile);
//       response.header("Content-Type", "application/pdf");
//       response.header("Content-Disposition", "attachment; filename=report.pdf");
//       // serve the compiled pdf
//       return response.send(pdfBuffer);
//       // delete the temporary typst file (?)
//     } catch (err) {
//       // await fs.unlink(tmpFile).catch(console.error);
//       console.error("Error:", err);
//       return response.status(500).send(err);
//     }
//   }
// >>>>>>> 903961179e1d6005e168ec08e49c1b40e5f20388
// }
