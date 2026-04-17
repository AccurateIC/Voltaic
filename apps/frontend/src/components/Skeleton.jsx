/* eslint-disable react/prop-types */
import React from "react";

const styles = `
@keyframes ng-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.ng-skeleton-root {
  width: 100%;
  height: 100%;
  min-height: inherit;
  --sk-radius: 0.75rem;
  --sk-root-bg: var(--color-base-200);
  --sk-base-200: var(--color-base-200);
  --sk-base-300: var(--color-base-300);

  background: var(--sk-root-bg);
  border-radius: var(--sk-radius);
  overflow: hidden;
  position: relative;
}

.ng-skeleton-root[data-animate="false"] .ng-skeleton-block {
  animation: none !important;
}

.ng-skeleton-block {
  background: linear-gradient(110deg, var(--sk-base-200) 15%, var(--sk-base-300) 45%, var(--sk-base-200) 75%);
  background-size: 240% 100%;
  animation: ng-shimmer 2.4s ease-in-out infinite;
  will-change: background-position;
}

@media (prefers-reduced-motion: reduce) {
  .ng-skeleton-block {
    animation: none !important;
  }
}
`;

const Skeleton = ({ type = "table", rows = 5, columns = 4, className = "", style, animate = true, radius = "0.75rem" }) => {
  return (
    <>
      <style>{styles}</style>
      <div className={`ng-skeleton-root ${className}`} style={{ ...style, ["--sk-radius"]: radius }} data-animate={animate ? "true" : "false"} aria-hidden="true">
        {type === "gauge" && (
          <div className="w-full h-full p-4 md:p-6 flex flex-col">
            <div className="ng-skeleton-block h-6 w-2/3 rounded mb-4" />
            <div className="flex-1 w-full flex items-center justify-center">
              <div style={{ width: "88%", maxWidth: "520px", aspectRatio: "2 / 1", position: "relative" }}>
                <div
                  className="ng-skeleton-block"
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderTopLeftRadius: "9999px",
                    borderTopRightRadius: "9999px",
                    borderBottomLeftRadius: "0.75rem",
                    borderBottomRightRadius: "0.75rem",
                    clipPath: "ellipse(50% 100% at 50% 100%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "15%",
                    right: "15%",
                    top: "24%",
                    bottom: "0%",
                    background: "var(--color-base-200)",
                    borderTopLeftRadius: "9999px",
                    borderTopRightRadius: "9999px",
                  }}
                />
              </div>
            </div>
            <div className="ng-skeleton-block h-10 w-40 rounded mx-auto mt-2" />
          </div>
        )}

        {type === "stat" && (
          <div className="w-full h-full p-4 md:p-6 flex flex-col items-center justify-center gap-4">
            <div className="ng-skeleton-block h-5 w-2/3 md:w-1/2 rounded self-start" />
            <div className="ng-skeleton-block rounded-full w-18 h-18 md:w-24 md:h-24" />
            <div className="ng-skeleton-block h-9 md:h-10 w-4/5 rounded" />
            <div className="ng-skeleton-block h-4 w-1/2 md:w-2/5 rounded" />
          </div>
        )}

        {type === "fuel" && (
          <div className="w-full h-full p-4 md:p-6 flex flex-col items-center">
            <div className="ng-skeleton-block h-6 w-1/2 rounded mb-6 self-start" />
            <div className="flex-1 w-full flex items-center justify-center">
              <div className="relative h-64 md:h-80 w-16 rounded-full overflow-hidden ng-skeleton-block" style={{ borderRadius: "9999px" }}>
                <div className="absolute inset-x-1 top-1 bottom-1 rounded-full" style={{ background: "var(--color-base-200)" }} />
              </div>
            </div>
          </div>
        )}

        {type === "chart" && (
          <div className="w-full h-full p-4 md:p-6 flex flex-col">
            <div className="ng-skeleton-block h-5 w-2/5 rounded mb-5" />
            <div className="flex-1 relative">
              <div className="absolute left-0 top-0 bottom-8 w-[2px]" style={{ background: "var(--color-base-300)" }} />
              <div className="absolute left-0 right-0 bottom-8 h-[2px]" style={{ background: "var(--color-base-300)" }} />
              <div className="absolute inset-0 flex items-end gap-2 px-3 pb-10">
                {[45, 72, 54, 80, 60, 68, 52, 76].map((h, i) => (
                  <div key={i} className="ng-skeleton-block rounded-t w-full" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {type === "table" && (
          <div className="w-full h-full p-2 md:p-4 flex flex-col gap-3">
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
              {Array.from({ length: columns }).map((_, i) => (
                <div key={`h-${i}`} className="ng-skeleton-block h-8 rounded" />
              ))}
            </div>
            <div className="flex-1 flex flex-col gap-2">
              {Array.from({ length: rows }).map((_, r) => (
                <div key={`r-${r}`} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                  {Array.from({ length: columns }).map((_, c) => (
                    <div key={`c-${r}-${c}`} className="ng-skeleton-block h-7 rounded" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {type === "card" && (
          <div className="w-full h-full p-4 md:p-6 flex flex-col gap-4">
            <div className="ng-skeleton-block h-6 w-2/5 md:w-1/2 rounded" />
            <div className="ng-skeleton-block h-4 w-4/5 rounded" />
            <div className="ng-skeleton-block h-4 w-3/5 rounded" />
            <div className="ng-skeleton-block h-4 w-4/5 rounded" />
            <div className="ng-skeleton-block h-4 w-5/6 rounded mt-auto" />
          </div>
        )}
      </div>
    </>
  );
};

export default Skeleton;
