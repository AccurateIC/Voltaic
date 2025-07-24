import React from "react";

export const GaugeChart = ({
  value = 0,
  min = 0,
  max = 100,
  title = "",
  size = 300,
  primaryColor = "#82ca9d",
}) => {
  const range = max - min;
  const percentage = (value - min) / range;
  const rotationAngle = -90 + percentage * 180;

  const generateTicks = () => {
    const ticks = [];
    const numTicks = 10;

    for (let i = 0; i <= numTicks; i++) {
      const tickAngle = -90 + i * (180 / numTicks);
      const isLongTick = i % 2 === 0;

      const innerRadius = isLongTick ? size * 0.35 : size * 0.38;
      const outerRadius = size * 0.4;

      const startX =
        size / 2 + innerRadius * Math.cos((tickAngle * Math.PI) / 180);
      const startY =
        size / 2 + innerRadius * Math.sin((tickAngle * Math.PI) / 180);
      const endX =
        size / 2 + outerRadius * Math.cos((tickAngle * Math.PI) / 180);
      const endY =
        size / 2 + outerRadius * Math.sin((tickAngle * Math.PI) / 180);

      let label = null;
      if (isLongTick) {
        const labelValue = min + (i * range) / numTicks;
        const labelRadius = size * 0.32;
        const labelX =
          size / 2 + labelRadius * Math.cos((tickAngle * Math.PI) / 180);
        const labelY =
          size / 2 + labelRadius * Math.sin((tickAngle * Math.PI) / 180);

        label = (
          <text
            x={labelX}
            y={labelY}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-gray-600"
          >
            {Math.round(labelValue)}
          </text>
        );
      }

      ticks.push(
        <g key={i}>
          <line
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke="#666"
            strokeWidth="2"
          />
          {label}
        </g>
      );
    }
    return ticks;
  };

  return (
    <div className="relative inline-block">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer arc */}
        <path
          d={`
            M ${size * 0.1} ${size * 0.5}
            A ${size * 0.4} ${size * 0.4} 0 0 1 ${size * 0.9} ${size * 0.5}
          `}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={size * 0.08}
          strokeLinecap="round"
        />

        {/* Progress arc */}
        <path
          d={`
            M ${size * 0.1} ${size * 0.5}
            A ${size * 0.4} ${size * 0.4} 0 0 1 ${size * 0.5} ${size * 0.1}
          `}
          fill="none"
          stroke={primaryColor}
          strokeWidth={size * 0.08}
          strokeLinecap="round"
          style={{
            transformOrigin: `${size / 2}px ${size / 2}px`,
            transform: `rotate(${rotationAngle}deg)`,
          }}
        />

        {/* Tick marks */}
        {generateTicks()}

        {/* Needle */}
        <g
          style={{
            transformOrigin: `${size / 2}px ${size / 2}px`,
            transform: `rotate(${percentage * 180 - 90}deg)`,
          }}
        >
          <line
            x1={size / 2}
            y1={size / 2}
            x2={size * 0.85}
            y2={size / 2}
            stroke="red"
            strokeWidth="2"
          />
          <circle cx={size / 2} cy={size / 2} r={size * 0.04} fill="red" />
        </g>

        {/* Value text */}
        <text
          x={size / 2}
          y={size * 0.7}
          textAnchor="middle"
          className="text-2xl font-bold"
        >
          {Math.round(value)}
        </text>

        {/* Title text */}
        {title && (
          <text
            x={size / 2}
            y={size * 0.8}
            textAnchor="middle"
            className="text-sm fill-gray-600"
          >
            {title}
          </text>
        )}
      </svg>
    </div>
  );
};
