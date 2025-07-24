import React from "react";

const ChartBox = ({ title, children }) => (
  <div className="bg-[#303030] bg-base-200 p-4 rounded shadow w-full h-[400px] flex flex-col justify-between">
    <h2 className="text-sm font-semibold mb-2 text-white text-center">{title}</h2>
    <div className="flex-1">{children}</div>
  </div>
);

export default ChartBox;
