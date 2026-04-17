export const SemiCircleGauge = ({ value, maxValue }: { value: number; maxValue: number }) => {
  const percentage = (value / maxValue) * 100;
  const degree = (percentage * 180) / 100;
  const circumference = Math.PI * 90;
  const arcLength = (degree / 360) * circumference;

  return (
    <svg
      viewBox="0 0 100 50"
      className="w-full h-auto max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Arc */}
      <path className="stroke-base-content/85" d="M5,50 A45,45 0 0,1 95,50" fill="none" strokeWidth="10" />
      {/* Foreground Arc */}
      <path
        className={`transition-all duration-300 ease-in-out stroke-success`}
        d="M5,50 A45,45 0 0,1 95,50"
        fill="none"
        strokeWidth="10"
        strokeDasharray={`${arcLength} ${circumference - arcLength}`}
        strokeDashoffset="0"
        transform="rotate(-90 50 50)"
      />
    </svg>
  );
};
