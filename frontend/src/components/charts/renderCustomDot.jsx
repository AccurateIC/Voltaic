const renderCustomDot = (props, isAnomaly) => {
  const { cx, cy, stroke, payload, value } = props;

  const dotColor = isAnomaly ? "red" : stroke;

  return <circle cx={cx} cy={cy} r={4} fill={dotColor} stroke="none" />;
};
export default renderCustomDot;
