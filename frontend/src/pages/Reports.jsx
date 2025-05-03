import React, { useRef, useState } from "react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import ReportsPdmChart from "../components/charts/ReportsPdmChart";
import ReportsRulChart from "../components/charts/ReportsRulChart";
import ReportAreaChart from "../components/charts/ReportsAreaChart";
import ReportsBarChart from "../components/charts/ReportsBarChart";
import ReportsPieChart from "../components/charts/ReportsPieChart";
import ReportsLineChart from "../components/charts/ReportsLineChart";
import ReportsVoltageChart from "../components/charts/ReportsVoltageChart";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

const removeUnsupportedColors = (element) => {
  const allElements = element.querySelectorAll("*");
  allElements.forEach((el) => {
    const bg = window.getComputedStyle(el).backgroundColor;
    if (bg.includes("oklch")) {
      el.style.backgroundColor = "#ffffff";
    }
  });
};

const ReportPage = () => {
  const [timeFilter, setTimeFilter] = useState("Week");
  const [propertyFilter, setPropertyFilter] = useState("All");

  const chartWrapperRef = useRef(null);

  const exportChartsToPDF = async () => {
    const chartWrapper = chartWrapperRef.current;
    if (!chartWrapper) return;

    removeUnsupportedColors(chartWrapper);

    // Temporarily force full height to render all content
    const originalStyle = chartWrapper.style.height;
    chartWrapper.style.height = "auto";

    const canvas = await html2canvas(chartWrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: document.body.scrollWidth,
      windowHeight: chartWrapper.scrollHeight,
    });

    // Reset height after capture
    chartWrapper.style.height = originalStyle;

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("charts.pdf");
  };

  return (
    <div className="bg-[#303030] text-white flex flex-col">
      {/* Header */}
      <div className="top-0 z-10 bg-[#303030] p-6 shadow flex flex-wrap gap-6 items-center">
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="px-8 py-2 bg-[#FFFFFF] text-black font-semibold rounded-xl shadow-inner"
          style={{ boxShadow: "4px 4px 10px 0px #00000040 inset" }}
        >
          <option value="Week">Time Filter</option>
        </select>

        <select
          value={propertyFilter}
          onChange={(e) => setPropertyFilter(e.target.value)}
          className="px-8 py-2 bg-[#FFFFFF] text-black font-semibold rounded-xl shadow-inner"
          style={{ boxShadow: "4px 4px 10px 0px #00000040 inset" }}
        >
          <option value="All">Properties</option>
        </select>

        <button
          className="ml-auto bg-[#B1D5BD] text-black px-4 py-2 font-semibold rounded-2xl"
          style={{
            boxShadow:
              "-1px -4px 4px 0px #00000080 inset, 1px 4px 4px 0px #FFFFFFBF inset",
          }}
          onClick={exportChartsToPDF}
        >
          Export to PDF
        </button>
      </div>

      <div ref={chartWrapperRef} className="p-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ReportsBarChart />
          <ReportsPieChart />
          <ReportsLineChart />
        </div>

        <ReportAreaChart />
        <ReportsVoltageChart />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="min-h-[400px]">
            <ReportsRulChart />
          </div>
          <div className="min-h-[400px]">
            <ReportsPdmChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
