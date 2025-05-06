import React, { useRef, useState, useEffect } from "react";
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
import ReportsOilPressure from "../components/charts/ReportsOilPressure";
import ReportsFuelLevel from "../components/charts/ReportsFuelLevel";
import ReportsBarChart from "../components/charts/ReportsBarChart";
import ReportsPieChart from "../components/charts/ReportsPieChart";
import ReportsLineChart from "../components/charts/ReportsLineChart";
import ReportsGenVoltage from "../components/charts/ReportsGenVoltage";
import ReportsMainsVoltage from "../components/charts/ReportsMainsVoltage";
import { FiRotateCcw } from "react-icons/fi";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

const removeUnsupportedColors = (element) => {
  const allElements = element.querySelectorAll("*");

  allElements.forEach((el) => {
    const bg = window.getComputedStyle(el).backgroundColor;

    if (bg.includes("oklch")) {
      el.style.backgroundColor = "#ffffff";
    }

    if (el.tagName === "P" && el.className.includes("text-sm")) {
      el.setAttribute("data-original-style", el.getAttribute("style") || "");
      el.style.backgroundColor = "#ffffff";
      el.style.color = "#000000";
      el.style.padding = "4px 8px";
      el.style.borderRadius = "8px";
    }
  });
};

const restoreOriginalStyles = (element) => {
  const allElements = element.querySelectorAll("*");
  allElements.forEach((el) => {
    const originalStyle = el.getAttribute("data-original-style");
    if (originalStyle !== null) {
      el.setAttribute("style", originalStyle);
      el.removeAttribute("data-original-style");
    }
  });
};

const chartOptions = [
  { label: "Total Anomalies", value: "Bar" },
  { label: "Type of Anomaly", value: "Pie" },
  { label: "Engine Speed", value: "Line" },
  { label: "Engine Oil pressure and Fuel level", value: "Area" },
  { label: "GeneratorVoltage", value: "Voltage" },
  { label: "Mains Voltage", value: "Voltage" },
  { label: "RUL", value: "RUL" },
  { label: "PDM", value: "PDM" },
];

const MultiSelectDropdown = ({ selected, setSelected }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleOption = (value) => {
    setSelected((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="px-8 py-2 bg-white text-black font-semibold rounded-xl shadow-inner min-w-[200px]"
        style={{ boxShadow: "4px 4px 10px 0px #00000040 inset" }}>
        {selected.length > 0 ? `${selected.length} selected` : "Select Properties"}
      </button>

      {open && (
        <div className="absolute z-10 mt-2 bg-white text-black rounded-xl shadow-lg w-full p-2 space-y-2 max-h-64 overflow-auto">
          {chartOptions.map((option) => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.includes(option.value)}
                onChange={() => toggleOption(option.value)}
                className="form-checkbox accent-green-500"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const ReportPage = () => {
  const [timeFilter, setTimeFilter] = useState("Week");
  const [propertyFilter, setPropertyFilter] = useState([]);
  const showAll = propertyFilter.length === 0;

  const chartWrapperRef = useRef(null);

  const exportChartsToPDF = async () => {
    const chartWrapper = chartWrapperRef.current;
    if (!chartWrapper) return;

    removeUnsupportedColors(chartWrapper);
    const originalStyle = chartWrapper.style.height;
    chartWrapper.style.height = "auto";

    const canvas = await html2canvas(chartWrapper, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: document.body.scrollWidth,
      windowHeight: chartWrapper.scrollHeight,
    });

    chartWrapper.style.height = originalStyle;
    restoreOriginalStyles(chartWrapper);

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save("charts.pdf");
  };

  return (
    <div className="bg-[#303030] text-white flex flex-col">
      <div className="top-0 z-10 bg-[#303030] p-6 shadow flex flex-wrap gap-6 items-center">
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="px-8 py-2 bg-[#FFFFFF] text-black font-semibold rounded-xl shadow-inner"
          style={{ boxShadow: "4px 4px 10px 0px #00000040 inset" }}>
          <option value="Week">Time Filter</option>
        </select>
        <MultiSelectDropdown selected={propertyFilter} setSelected={setPropertyFilter} />
        <button
          className="ml-auto bg-[#B1D5BD] text-black px-4 py-2 font-semibold rounded-2xl"
          style={{
            boxShadow: "-1px -4px 4px 0px #00000080 inset, 1px 4px 4px 0px #FFFFFFBF inset",
          }}
          onClick={exportChartsToPDF}>
          Export to PDF
        </button>
        <button
          onClick={() => setPropertyFilter([])}
          className="bg-white text-black p-2 rounded-full flex items-center gap-2 shadow"
          title="Reset"
          style={{ boxShadow: "2px 2px 6px rgba(0,0,0,0.3)" }}>
          <FiRotateCcw size={18} />
        </button>
      </div>

      <div ref={chartWrapperRef} className="p-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(showAll || propertyFilter.includes("Bar")) && (
            <div>
              <ReportsBarChart timeFilter={timeFilter} />
              <p className="text-sm text-gray-300 mt-2">Shows total anomalies detected during the selected period.</p>
            </div>
          )}
          {(showAll || propertyFilter.includes("Pie")) && (
            <div>
              <ReportsPieChart timeFilter={timeFilter} />
              <p className="text-sm text-gray-300 mt-2">Displays distribution of anomaly types detected.</p>
            </div>
          )}
          {(showAll || propertyFilter.includes("Line")) && (
            <div>
              <ReportsLineChart timeFilter={timeFilter} />
              <p className="text-sm text-gray-300 mt-2">Shows variations in engine speed over time.</p>
            </div>
          )}
        </div>

        {(showAll || propertyFilter.includes("Area")) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ReportsOilPressure timeFilter={timeFilter} />
              <p className="text-sm text-gray-300 mt-2">
                Displays variations in engine oil pressure to monitor lubrication system health.
              </p>
            </div>
            <div>
              <ReportsFuelLevel timeFilter={timeFilter} />
              <p className="text-sm text-gray-300 mt-2">Tracks fuel level trends for efficiency and refueling insights.</p>
            </div>
          </div>
        )}

        {(showAll || propertyFilter.includes("Voltage")) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ReportsGenVoltage timeFilter={timeFilter} />
              <p className="text-sm text-gray-300 mt-2">
                Generator voltage trends over the selected time period. Helps detect power fluctuations and generator health.
              </p>
            </div>
            <div>
              <ReportsMainsVoltage timeFilter={timeFilter} />
              <p className="text-sm text-gray-300 mt-2">
                Mains voltage monitoring for identifying grid stability and potential outages.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(showAll || propertyFilter.includes("RUL")) && (
            <div className="min-h-[400px]">
              <ReportsRulChart timeFilter={timeFilter} />
              <p className="text-sm text-gray-300 mt-6">Estimates Remaining Useful Life based on sensor analytics.</p>
            </div>
          )}
          {(showAll || propertyFilter.includes("PDM")) && (
            <div className="min-h-[400px]">
              <ReportsPdmChart timeFilter={timeFilter} />
              <p className="text-sm text-gray-300 mt-6">Displays Predictive Maintenance trends and alerts.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
