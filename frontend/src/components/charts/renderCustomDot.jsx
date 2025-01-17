// const renderCustomDot = (props, isAnomaly) => {
//   const { cx, cy, stroke, payload, value } = props;

//   const dotColor = isAnomaly ? "red" : stroke;

//   return <circle cx={cx} cy={cy} r={4} fill={dotColor} stroke="none" />;
// };
// export default renderCustomDot;



const renderCustomDot = (props, isAnomaly) => {
  const { cx, cy, stroke, payload, value } = props;

  // Determine the color of the dot based on the anomaly status
  const dotColor = isAnomaly ? "red" : stroke;

  return <circle cx={cx} cy={cy} r={4} fill={dotColor} stroke="none" />;
};export default renderCustomDot;