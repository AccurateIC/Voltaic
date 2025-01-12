const renderCustomDot = (props, isAnomaly) => {
    const { cx, cy } = props; // cx and cy represent the coordinates of the dot
    const color = isAnomaly ? "red" : "blue"; // Decide color based on the anomaly flag
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4} // Radius of the dot
        fill={color} // Use the color variable instead of hardcoding
        stroke={color} // Stroke matches the fill
        strokeWidth={1}
      />
    );
  };
  
  export default renderCustomDot;
  