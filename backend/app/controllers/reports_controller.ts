

import type { HttpContext } from "@adonisjs/core/http"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "url"
import { spawn } from "node:child_process"
import Archive from "#models/archive"
import { DateTime } from "luxon"
import { ArchiveService } from "#services/archive_service"
import { PdmService } from "#services/pdm_service"
import { RulService } from "../../app/services/rul_service.js"
import { filteredHealthIndexData } from "./filteredHealthIndex.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const typstBase = `
#import "@preview/lilaq:0.2.0" as lq
#import "@preview/cetz:0.4.0"
#import "@preview/cetz:0.2.2"
#import "@preview/cetz-plot:0.1.2": chart

// Document setup

// #set document(
//   title: "Generator Performance Report",
//   author: "NeuroGen Analytics"
// )

// // Page setup
// #set page(
//   paper: "a4",
//   margin: (
    
//     bottom: 2cm,
   
//   ),
//   header: align(right)[
//     #image("logo.png", width: 20%)
//   ],
//   numbering: "1"
// )

// // Text formatting
// #set text(
//   font: "Liberation Sans",
//   size: 11pt,
//   lang: "en"
// )

// // Heading setup
// #set heading(numbering: "1.")

// // Title page
// #align(center)[
//   #box(
//     stroke: black, // border color
//     radius: 6pt,   // optional: rounded corners
//     inset: 120pt,   // optional: padding inside the border
//     width: auto,
//     height: auto
//   )[
//     #v(3.5cm) // 👈 Space below logo/header

//     #box(
//       fill: rgb("c6efce"),
//       width: 100%,
//       height: 110pt,
//       inset: 10pt,
//       radius: 4pt
//     )[
//       #align(bottom)[
//         #text(
//           "Generator Performance Report",
//           size: 16pt,
//           weight: "bold"
//         )
//       ]
//     ]

//     #v(0.8cm)
//     #text(size: 16pt, style: "italic")[Comprehensive Analysis & Monitoring Dashboard]

//     #v(0.8cm)
//     #table(
//       columns: 2,
//       stroke: none,
//       align: left,
//       inset: 8pt,
//       [*Report Generated:*], [#datetime.today().display()],
//       [*Report Period:*], [{{TIME_PERIOD_RANGE}}],
//       [*Report Type:*], [{{REPORT_TYPE}}],
//     )
//   ]
// ]
// 


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
  // 👈 Push green box below the logo area
  #box(
    fill: rgb("c6efce"),
    width: 110%,
    height: 190pt,
    inset: 10pt,
    radius: 4pt
  )[
    #align(bottom)[ // 👈 Align content to bottom inside the green box
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
`

/**
 * Compiles a Typst file to PDF and returns the PDF as a Buffer
 * @param tmpFile Path to the Typst file
 * @returns Promise resolving to a Buffer containing the PDF data
 */
const compilePdf = (tmpFile: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const compileProc = spawn("typst", ["compile", tmpFile, "-"])
    const pdfBuffers: Buffer[] = []

    compileProc.stdout.on("data", (chunk) => {
      pdfBuffers.push(chunk)
    })

    compileProc.stderr.on("data", (data) => {
      reject(data.toString())
    })

    compileProc.on("close", async (code) => {
      if (code !== 0) reject(`Compiler exited with code ${code}`)
      resolve(Buffer.concat(pdfBuffers))
    })
  })
}

export default class ReportsController {
  /**
   * Retrieves all archive data
   * @returns Promise resolving to an array of Archive objects
   */
  async getData(): Promise<Archive[]> {
    const archiveData = Archive.all()
    return archiveData as Promise<Archive[]>
  }

  /**
   * Generates a PDF report based on the request parameters
   * @param param0 HttpContext containing request and response objects
   * @returns HTTP response with the generated PDF
   */
  async generateDummy({ request, response }: HttpContext) {
    const tmpFile = path.join(__dirname, "report.typ")

    try {
      // Extract request parameters
      const { properties, anomaliesCount, anomaliesByProperty, pdm, rul } = request.body()
      const requestBody = request.body()
      const selectedPropertyNames = requestBody.properties || []

      // Get property statistics
      const propertyStats = (
        await Archive.query()
          .whereHas("gensetProperty", (query) => {
            query.whereIn("propertyName", selectedPropertyNames)
          })
          .preload("gensetProperty")
          .select("gensetPropertyId")
          .groupBy("gensetPropertyId")
      ).map((value) => ({
        readablePropertyName: value.gensetProperty.readablePropertyName,
        gensetPropertyId: value.gensetPropertyId,
        propertyName: value.gensetProperty.propertyName,
      }))

      // Get property data
      const resultData = await ArchiveService.getPropertyStatistics({ request })
      const durationTime = resultData?.meta.timeDuration

      // Helper function to get week range
      function getWeekRange(week: number, month: number, year: number) {
        const start = DateTime.fromObject({ weekYear: year, weekNumber: week, weekday: 1 })
        return { start, end: start.endOf("week") }
      }

      // Helper function to format date labels
      function formatLabel(entry: any): string {
        switch (durationTime) {
          case "year":
            return DateTime.fromObject({ year: entry.year, month: entry.month, day: 1 }).toFormat("LLL")
          case "month": {
            const { start, end } = getWeekRange(entry.week, entry.month, entry.year)
            return `${start.toFormat("MMM d")} - ${end.toFormat("MMM d")}`
          }
          case "week":
            return DateTime.fromObject({ day: entry.day, month: entry.month, year: entry.year }).toFormat("ccc LLL dd")
          default:
            return ""
        }
      }

      // Function to generate time period information - modify this function
      function getTimePeriodInfo(durationTime: string, resultData: any) {
        const currentDate = new Date()
        let title = ""
        let range = ""
        let reportType = ""

        // Get actual date range from resultData if available
        const startDate = resultData?.meta?.startDate || currentDate
        const endDate = resultData?.meta?.endDate || currentDate

        switch (durationTime) {
          case "week":
            title = "Weekly Performance Report"
            reportType = "Weekly Performance Analysis"

            // Use actual data dates if available, otherwise calculate current week
            if (resultData?.meta?.startDate && resultData?.meta?.endDate) {
              const start = new Date(startDate)
              const end = new Date(endDate)
              range = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
            } else {
              const startOfWeek = new Date(currentDate)
              startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
              const endOfWeek = new Date(startOfWeek)
              endOfWeek.setDate(startOfWeek.getDate() + 6)
              range = `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`
            }
            break

          case "month":
            title = "Monthly Performance Report"
            reportType = "Monthly Performance Analysis"

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
              ]
              range = `${monthNames[resultData.meta.month - 1]} ${resultData.meta.year}`
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
              ]
              range = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
            }
            break

          case "year":
            title = "Annual Performance Report"
            reportType = "Annual Performance Analysis"

            // Use actual year from data if available
            if (resultData?.meta?.year) {
              range = `${resultData.meta.year}`
            } else {
              range = `${currentDate.getFullYear()}`
            }
            break

          default:
            title = "Custom Performance Report"
            reportType = "Custom Performance Analysis"

            // Handle custom date ranges
            if (resultData?.meta?.startDate && resultData?.meta?.endDate) {
              const start = new Date(startDate)
              const end = new Date(endDate)
              range = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
            } else {
              range = "Custom Period"
            }
        }

        return { title, range, reportType }
      }

      // Group data by property ID
      const groupedData = resultData.data.reduce<Record<number, typeof resultData.data>>((acc, entry) => {
        const key = entry.genset_property_id
        ;(acc[key] ||= []).push(entry)
        return acc
      }, {})

      // Function to generate bar chart for property data with new layout
      const generateTypstBarChart = (
        title: string,
        xs: object[],
        ys: object[],
        durationTime: string,
        timePeriodInfo: any,
      ) => {
        let granularity = ""
        let description = ""

        if (durationTime === "week") {
          granularity = "daily"
          description = "This chart displays daily average values for the selected week period."
        } else if (durationTime === "month") {
          granularity = "weekly"
          description = "This chart shows weekly average trends for the selected month period."
        } else if (durationTime === "year") {
          granularity = "monthly"
          description = "This chart presents monthly performance trends for the selected year period."
        }

        const average = (ys as number[]).reduce((a, b) => a + b, 0) / ys.length
        const maximum = Math.max(...(ys as number[]))
        const minimum = Math.min(...(ys as number[]))
        const trend = (ys as number[])[ys.length - 1] > (ys as number[])[0] ? "an increasing" : "a decreasing"

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
      xlabel: [Time Period (${granularity})],
      ylabel: [${title}],
      xaxis: (
        ticks: (${xs.map((v) => `"${v}"`).join(", ")})
          .map(rotate.with(-45deg, reflow: true))
          .map(align.with(right))
          .enumerate(),
      ),
      lq.bar(
        range(${ys.length}), 
        (${ys.join(", ")}), 
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

`
      }

      // Function to generate anomaly bar chart with new layout
      const generateAnomalyBarChart = (xsl: object[], ysl: object[]) => {
        const totalAnomalies = (ysl as number[]).reduce((a, b) => a + b, 0)

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

`
      }

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

`
      }

      // Function to generate PDM bar chart with new layout
      const generatePDMBarChart = (xs: object[], counts: object[]) => {
        const totalNotifications = (counts as number[]).reduce((a, b) => a + b, 0)

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
        ticks: (${xs.map((v) => `"${v}"`).join(", ")})
          .map(rotate.with(-45deg, reflow: true))
          .map(align.with(right))
          .enumerate(),
      ),
      lq.bar(
        range(${counts.length}), 
        (${counts.join(", ")}),
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

`
      }

      // Function to generate RUL line chart with new layout
      const rulLineChart = (timeHours: number[], predictiveHealthIndex: number[]) => {
        const currentHealthIndex =
          filteredHealthIndexData[filteredHealthIndexData.length - 1]?.Predicted_Health_Index || 0
        const predictedEndHealth = predictiveHealthIndex[predictiveHealthIndex.length - 1] || 0
        const maxHours = Math.max(...timeHours)

        return `
= Remaining Useful Life (RUL) Prediction

This section provides advanced analytics on equipment health trends and remaining useful life predictions using machine learning models.

// Centered chart with larger size
#align(center)[
  #box(width: 100%, height: 300pt)[
    #lq.diagram(
      width: 12cm,
      height: 9cm,
      xlabel: [Time (Hours)],
      ylabel: [Health Index],
      legend: (position: top + right),
      lq.plot(
        (${filteredHealthIndexData.map((d) => d.Time_Hours).join(", ")}), 
        (${filteredHealthIndexData.map((d) => d.Predicted_Health_Index).join(", ")}), 
        mark: "o", 
        label: [Historical Trend],
        stroke: rgb("#059669")
      ),
      lq.plot(
        (${timeHours.join(", ")}), 
        (${predictiveHealthIndex.join(", ")}), 
        mark: "s", 
        label: [RUL Prediction],
        stroke: rgb("#dc2626")
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
    
    // Left column - RUL analysis
    [
      #set text(size: 11pt)
      
      *RUL Analysis Summary*
      
      *Current Health Index:* ${currentHealthIndex.toFixed(2)}
      
      *Predicted End Health:* ${predictedEndHealth.toFixed(2)}
      
      *Prediction Horizon:* ${maxHours} hours
      
      *Model Accuracy:* High confidence ML prediction
      
      *Health Index Scale:*
      - 1.0: Excellent condition
      - 0.8: Good condition  
      - 0.6: Fair condition
      - 0.4: Poor condition
      - 0.2: Critical condition
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
      ${currentHealthIndex < 0.4 ? "Critical - Immediate action required" : currentHealthIndex < 0.6 ? "Moderate - Plan maintenance soon" : "Low - Continue monitoring"}
    ]
  )
]

#pagebreak()

`
      }

      // Get data from services
      const timezone = request.header("timezone")
      const anomalyResult = await ArchiveService.getAnomalyStatistics(timezone)
      const pdmData = await PdmService.maintenanceNotificationStatistics({ request })
      const rulPrediction = await RulService.fetchPrediction({ request })

      const xsl = Object.entries(anomalyResult.overall).map(([key, _]) => key)
      const ysl = Object.entries(anomalyResult.overall).map(([_, value]) => value)
      const propertynm = anomalyResult.byProperty.map((item) => item.readablePropertyName)
      const totalAnomaly = anomalyResult.byProperty.map((item) => item.total)

      const counts = pdmData.data.map((entry) => Number(entry.count))
      const xs = pdmData.data.map(formatLabel)

      const predictiveHealthIndex = rulPrediction.Future_Predictions.map((data) => data.Predicted_Health_Index)
      const timeHours = rulPrediction.Future_Predictions.map((data) => data.Time_Hours)

      // After getting the time period info, replace the template placeholders:
      // Get time period information
      const timePeriodInfo = getTimePeriodInfo(durationTime, resultData)
          // Generate property charts
      let allChartsTypstCode = "" // Initialize here, outside the loop
      if (Object.keys(groupedData).length > 0) {
        allChartsTypstCode += `
= Generator Performance Metrics

This section provides detailed analysis of key generator performance parameters monitored during the reporting period. Each chart represents statistical analysis of sensor data collected at regular intervals.


`

        for (const [propertyIdStr, entries] of Object.entries(groupedData)) {
          if (!Array.isArray(entries)) {
            console.warn(`Skipping non-array entry for propertyId: ${propertyIdStr}`)
            continue
          }

          const xs = entries.map(formatLabel)
          const ys = entries.map((entry) => entry.avg)
          const propertyId = Number(propertyIdStr)
          const matched = propertyStats.find((p) => p.gensetPropertyId === propertyId)

          if (!matched) continue

          const title = matched.readablePropertyName
          allChartsTypstCode += generateTypstBarChart(title, xs, ys, durationTime, timePeriodInfo)
        }
      }

      // Build the complete document with time period information - REPLACE ALL PLACEHOLDERS
      let typstDoc = typstBase
        .replace(/\{\{TIME_PERIOD_TITLE\}\}/g, timePeriodInfo.title)
        .replace(/\{\{TIME_PERIOD_RANGE\}\}/g, timePeriodInfo.range)
        .replace(/\{\{REPORT_TYPE\}\}/g, timePeriodInfo.reportType)

      if (anomaliesCount) {
        typstDoc += generateAnomalyBarChart(xsl, ysl)
      }

      if (anomaliesByProperty) {
        typstDoc += generatePropertyAnomalyChart(propertynm, totalAnomaly)
      }

      // Declare the variable before using it
   

      if (allChartsTypstCode) {
        typstDoc += allChartsTypstCode
      }

      if (pdm) {
        typstDoc += generatePDMBarChart(xs, counts)
      }

      if (rul) {
        typstDoc += rulLineChart(timeHours, predictiveHealthIndex)
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
`

      // Write the Typst document to a file and compile it
      await fs.writeFile(tmpFile, typstDoc)
      const pdfBuffer = await compilePdf(tmpFile)

      // Send the PDF as a response
      response.header("Content-Type", "application/pdf")
      response.header("Content-Disposition", "attachment; filename=generator-report.pdf")
      response.send(pdfBuffer)
    } catch (error) {
      console.error("Error:", error)
      response.status(500).send("An error occurred while generating the report.")
    }
  }
}




// import type { HttpContext } from "@adonisjs/core/http";
// import fs from "node:fs/promises";
// import path from "node:path";
// import { fileURLToPath } from "url";
// import { spawn } from "node:child_process";
// import Archive from "#models/archive";
// import { DateTime } from "luxon";
// import { ArchiveService } from "#services/archive_service";
// import { PdmService } from "#services/pdm_service";
// import { filteredHealthIndexData } from "./filteredHealthIndex.js";
// import { RulService } from "../../app/services/rul_service.js";
// import { argv } from "node:process";
// import { count } from "node:console";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const typstBase = `
// // packages
// #import "@preview/lilaq:0.2.0" as lq
// #import "@preview/cetz:0.4.0"
// #import "@preview/cetz:0.2.2"
// #import "@preview/cetz-plot:0.1.2": chart

// #set page(
//   margin: (
//     top: 3cm,        // no top margin: header/logo goes right at top
//     bottom: 2cm,
//     x: 1.5cm,
//   ),
//   header: align(right)[
//     #image("logo.png", width: 20%)
//   ],
//   numbering: "1"
// )

// // Add padding *before* your main content to push it down below the header:
// #set align(center  ) 
// #pad(top: 10cm)[
//   = Generator Report
// ]

// // set doc metadata
// // #set document(author: "NeuroGen", title: "NeuroGen Report")

// // font style
//  #set text(font: "New Computer Modern", size: 11pt, lang: "en", ligatures: false)

// // page properties

// #set page(margin: 0.5in, paper: "a4")
// // Small caps for section titles
// = Generator Report 
// #set heading(numbering: "1.")

// // #show heading.where(level: 2): it => [
// //   #pad(top: 0pt, bottom: -10pt, [#(it.body)])
// //   // #line(length: 100%, stroke: 0.1pt)
// // ]



// // ]`;

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
//       // await fs.unlink(tmpFile).catch(console.error);
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
//   async generateDummy({ request, response }: HttpContext) {
//     const tmpFile = path.join(__dirname, "report.typ");
//     try {
//       const { properties, anomaliesCount, anomaliesByProperty, pdm, rul } = request.body();
//       const requestBody = request.body();
//       const selectedPropertyNames = requestBody.properties || [];

//       const propertyStats = (
//         await Archive.query()
//           .whereHas("gensetProperty", (query) => {
//             query.whereIn("propertyName", selectedPropertyNames);
//           })
//           .preload("gensetProperty")
//           .select("gensetPropertyId")
//           .groupBy("gensetPropertyId")
//       ).map((value) => ({
//         readablePropertyName: value.gensetProperty.readablePropertyName,
//         gensetPropertyId: value.gensetPropertyId,
//         propertyName: value.gensetProperty.propertyName,
//       }));

//       const resultData = await ArchiveService.getPropertyStatistics({ request });
//       const durationTime = resultData?.meta.timeDuration;
//       function getWeekRange(week: number, month: number, year: number) {
//         const start = DateTime.fromObject({ weekYear: year, weekNumber: week, weekday: 1 });
//         return { start, end: start.endOf("week") };
//       }

//       const groupedData = resultData.data.reduce<Record<number, typeof resultData.data>>((acc, entry) => {
//         const key = entry.genset_property_id;
//         (acc[key] ||= []).push(entry);
//         return acc;
//       }, {});

//       const generateTypstBarChart = (title: string, xs: object[], ys: object[], durationTime: string) => {
//         let granularity = "";
//         if (durationTime === "week") {
//           granularity = "day";
//         } else if (durationTime === "month") {
//           granularity = "week";
//         } else if (durationTime === "year") {
//           granularity = "month";
//         }
//         return `

//             #box(height: 9cm)[
//             #grid(
//             columns: (1fr, 1fr),
//             inset:20pt,

//             align(center)[
//             == *${title}  Monitor*
//             // #set align(top + center)
//             #let xs = (${xs.map((v) => `"${v}"`).join(", ")})
//             #let ys = (${ys.join(", ")})

//             #box(width: 80%, height: 160pt)[
//             #lq.diagram(
//             width: 7cm,
//             height: 6cm,
//             legend: (position: left + top),
//             xaxis: (
//               ticks: xs
//                   .map(rotate.with(-45deg, reflow: true))
//                   .map(align.with(right))
//                   .enumerate(),
//                 ),
//                 lq.bar(range(${ys.length}), ys, label: ["${title}"], width: 0.7)
//                 )
//               ]
//             ],

//        [

//          Property Name: *${title}*

//           This chart shows the average ${title} values recorded for the ${durationTime} duration by each ${granularity} average data.

//         ]
//           )]

//       `;
//       };

//       //   const generateTypstBarChart = (
//       //   title: string,
//       //   xs: string[],
//       //   ys: number[],
//       //   durationTime: string
//       // ): string => {
//       //   if (xs.length !== ys.length) return "";

//       //   const granularity =
//       //     durationTime === "week"
//       //       ? "day"
//       //       : durationTime === "month"
//       //       ? "week"
//       //       : durationTime === "year"
//       //       ? "month"
//       //       : durationTime;

//       //   // 👇 Convert to Typst element sequence with trailing comma
//       //   const xsTypst = `(${xs.map((v) => `"${v}"`).join(", ")},)`;
//       //   const ysTypst = `(${ys.join(", ")},)`;

//       //   return `
//       // #box(height: 9cm)[
//       //   #grid(
//       //     columns: (1fr, 1fr),
//       //     inset: 20pt,

//       //     align(center)[
//       //       == *${title} Monitor*
//       //       #let xs = ${xsTypst}
//       //       #let ys = ${ysTypst}

//       //       #box(width: 80%, height: 160pt)[
//       //         #lq.diagram(
//       //           width: 7cm,
//       //           height: 6cm,
//       //           legend: (position: left + top),
//       //          xaxis: (
//       //   ticks: (
//       //     ticks: range(xs.len()),
//       //     labels: xs
//       //       .map(rotate.with(-45deg, reflow: true))
//       //       .map(align.with(right)),
//       //   ),
//       // ),

//       //           lq.bar(range(ys.len()), ys, label: ["${title}"], width: 0.7)
//       //         )
//       //       ]
//       //     ],

//       //     [
//       //       Property Name: *${title}*

//       //       This chart shows the average ${title} values recorded for the ${durationTime} duration by each ${granularity} average data.
//       //     ]
//       //   )
//       // ]
//       // `;
//       // };

//       function formatLabel(entry: any): string {
//         switch (durationTime) {
//           case "year":
//             return DateTime.fromObject({ year: entry.year, month: entry.month, day: 1 }).toFormat("LLL");
//           case "month": {
//             const { start, end } = getWeekRange(entry.week, entry.month, entry.year);
//             return `${start.toFormat("MMM d")} - ${end.toFormat("MMM d")}`;
//           }
//           case "week":
//             return DateTime.fromObject({ day: entry.day, month: entry.month, year: entry.year }).toFormat("ccc LLL dd");
//           default:
//             return "";
//         }
//       }

//       let allChartsTypstCode = "";
//       for (const [propertyIdStr, entries] of Object.entries(groupedData)) {
//         if (!Array.isArray(entries)) {
//           console.warn(`Skipping non-array entry for propertyId: ${propertyIdStr}`, {
//             receivedType: typeof entries,
//             value: entries,
//           });
//         }

//         const xs = entries.map(formatLabel);
//         const ys = entries.map((entry) => entry.avg);
//         const propertyId = Number(propertyIdStr);
//         const matched = propertyStats.find((p) => p.gensetPropertyId === propertyId);
//         if (!matched) continue;

//         const title = matched.readablePropertyName;
//         allChartsTypstCode += generateTypstBarChart(title, xs, ys, durationTime);
//       }

//       const timezone = request.header("timezone");
//       const result = await ArchiveService.getAnomalyStatistics(timezone);
//       const xsl = Object.entries(result.overall).map(([key, _]) => key);
//       const ysl = Object.entries(result.overall).map(([_, value]) => value);

//       const generateAnomalyBarChart = (xsl: object[], ysl: object[]) => {
//         return `
//         #set align(left)
//   = Anomaly Count 


//         #box(height: 9cm)[
//         #grid(
//         columns: (1fr, 1fr),
//         inset:10pt,
//         align: horizon,
//           [
//           #set align(top + center)
//           #let xsl = (${xsl.map((v) => `"${v}"`).join(", ")})
//           #let ysl = (${ysl.join(", ")})
//           // #box(width: 50%, height: 5pt)[
//           //  #set align(top + left)
//           #lq.diagram(
//             width: 7cm,
//             height: 6cm,
//             xaxis: (
//                     ticks: xsl .map(rotate.with(-45deg, reflow: true))
//                     .map(align.with(right)).enumerate(),
//                     ),
          
//             lq.bar(range(${ysl.length}), ysl)
//              )
//           ],
//           align(center)[
          
//           #box(inset: (top: 1pt,  right: 70pt))[
//           #set align(left)
//           #set text(weight: 150, size: 14pt)
         
//           #let xsl = (${xsl.map((v) => `"${v}"`).join(", ")})
//           #let ysl = (${ysl.join(", ")})
//           - Anomaly by Time Duration
//            #for i in range(xsl.len()) [
//             - #xsl.at(i)'s Anomalies : #ysl.at(i) \\
//            ]
//           ]
//            ]
//       )]`;
//       };

//       const propertynm = result.byProperty.map((item) => item.readablePropertyName);
//       const totalAnomaly = result.byProperty.map((item) => item.total);

//       const generatePropertyAnomalyChart = (propertynm, totalAnomaly) => {
//         return `
//          #set align(left)
//         = Anomaly By Property

//             #let xsl = (${propertynm.map((v) => `"${v}"`).join(", ")})
//             #let ysl = (${totalAnomaly.join(", ")})
            

//             #box(height: 9cm)[
//             #grid(
//             columns: (1fr, 1fr),
//             inset: -12pt,
//             align: horizon,
//             [
//             #set align(top + center)
            
// #pad(top: 1cm, bottom: 1cm)[
//             #lq.diagram(
//             width: 7cm,
//             height: 6cm,
//             xaxis: (
//             ticks: xsl.map(rotate.with(-45deg, reflow: true)).map(align.with(right)).enumerate(),
//             ),
//             lq.bar(range(${totalAnomaly.length}), ysl)
//       )]
//            ],
//            align(center)[
//            #box(inset: (bottom: 90pt, right: 70pt))[
//            #set align(left)
//            #set text(weight: 150, size: 12pt)
//            - Total anomalies of properties
//            #for i in range(xsl.len()) [
      
//             - #xsl.at(i) : #ysl.at(i) \\
        
//           ] 
//          ]
//          ]
//       )]`;
//       };

//       const pdmData = await PdmService.maintenanceNotificationStatistics({ request });
//       const counts = pdmData.data.map((entry) => Number(entry.count));
//       const xs = pdmData.data.map(formatLabel);

//       const generatePDMBarChart = (xs: object[], counts: object[]) => {
//         return `
//         = PDM Notification Graph
//            #let xs = (${xs.map((v) => `"${v}"`).join(", ")})
//            #let count = (${counts.join(", ")})
//            #box(height: 8cm)[
//            #grid(
//            columns: (1fr, 1fr),
//            inset:10pt,
//            align: horizon,
//            [
//            #set align(top + center)
           
//            // #box(width: 50%, height: 5pt)[
//            //  #set align(top + left)
//            #lq.diagram(
//             width: 7cm,
//             height: 6cm,
//             xaxis: (
//                     ticks: xs.map(rotate.with(-45deg, reflow: true))
//                     .map(align.with(right)).enumerate(),
//                     ),
          
//             lq.bar(range(${counts.length}), count)
//              )
//           ],
//           align(center)[
//           #box(inset: (top: 1pt,  right: 70pt))[
//           #set align(left)
//           #set text(weight: 150, size: 14pt)
         
//           // #let xsl = (${xsl.map((v) => `"${v}"`).join(", ")})
//           // #let ysl = (${ysl.join(", ")})
//           // - Anomaly by Time Duration
//           //  #for i in range(xsl.len()) [
//           //   - #xsl.at(i)'s Anomalies : #ysl.at(i) 
//              Numder of PDM alerts forecasted by ML model  
//           //  ]
//           ]
//           ]
//       )
//           ]`;
//       };

//       const rulPrediction = await RulService.fetchPrediction({ request });
//       const predictiveHealthIndex = rulPrediction.Future_Predictions.map((data) => data.Predicted_Health_Index);
//       const timeHours = rulPrediction.Future_Predictions.map((data) => data.Time_Hours);
//       const xs2 = filteredHealthIndexData.map((d) => d.Time_Hours);
//       const ys2 = filteredHealthIndexData.map((d) => d.Predicted_Health_Index);

//       const rulLineChart = (timeHours: number[], predictiveHealthIndex: number[]) => {
//         return `
//             = RUL Predictions
//             #let xs = (${timeHours.join(", ")})
//             #let ys = (${predictiveHealthIndex.join(", ")})
//             #let xs1 = (${xs2.join(", ")})
//             #let ys1 = (${ys2.join(", ")})
//             #box(height: 8cm)[
//             #grid(
//             columns: (1fr, 1fr),
//             inset:10pt,
//             align: horizon,
//             [
//             #set align(top + center)
//             #lq.diagram(
//             width: 7cm,
//             height: 6cm,

//             xlabel: [Time (Hours)], 
//             ylabel: [Predicted Health Index],

//             lq.plot(xs, ys, mark: "o", label: [Predicted Health Index]),
//             lq.plot( xs1,  ys1, mark: "s", label: [Health Index Trends ])
//             )
//             ],
//             align(center)[
//              #box(inset: (top: 1pt,  right: 70pt))[
//             #set align(left)
//             #set text(weight: 150, size: 14pt)
//            This graph shows the Health Index Trend with calculated Remaining Useful Life (RUL) at the current point, alongside a Simulated Health Index curve predicting future deterioration until the failure threshold is reached.
//             ]
//             ]
//         )
//           ]`;
//       };

//       let typstDoc = typstBase;

//       if (anomaliesCount) {
//         typstDoc += generateAnomalyBarChart(xsl, ysl);
//       }

//       if (anomaliesByProperty) {
//         typstDoc += generatePropertyAnomalyChart(propertynm, totalAnomaly);
//       }

//       const des = ` \n=  GensetProperty Charts;`;

//       if (allChartsTypstCode) {
//         typstDoc += des;
//         typstDoc += allChartsTypstCode;
//       }
//       if (pdm) {
//         typstDoc += generatePDMBarChart(xs, counts);
//       }

//       if (rul) {
//         typstDoc += rulLineChart(timeHours, predictiveHealthIndex);
//       }

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
// }
