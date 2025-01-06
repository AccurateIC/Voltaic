// src/pages/Engine.jsx
import { useEffect, useState } from "react";
import ResponsiveGridLayout from "react-grid-layout";
import { useMessageBus } from "../lib/MessageBus";
import { Toolbar } from "../components/Toolbar";
import { toast } from "sonner";

const defaultLayout = [
  { w: 3, h: 7, x: 0, y: 0, i: "a", moved: false, static: false },
  { w: 1, h: 1, x: 3, y: 0, i: "b", moved: false, static: false },
  { w: 1, h: 6, x: 3, y: 1, i: "c", moved: false, static: false },
  { w: 4, h: 3, x: 0, y: 7, i: "d", moved: false, static: false },
  { w: 4, h: 8, x: 4, y: 0, i: "e", moved: false, static: false },
  { w: 4, h: 2, x: 4, y: 8, i: "f", moved: false, static: false },
];

function Engine() {
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };

  const [shouldToolbarBeVisible, setShouldToolbarBeVisible] = useState(true);
  const [rglContainerWidth, setRglContainerWidth] = useState(1650);
  const [layout, setLayout] = useState(() => {
    const savedLayout = localStorage.getItem("engine-page-layout");
    console.log(savedLayout);
    if (savedLayout) {
      return JSON.parse(savedLayout);
    } else {
      return defaultLayout;
    }
  });
  const [isLayoutEditable, setIsLayoutEditable] = useState(false);

  useMessageBus("edit-layout", (msg) => {
    console.log(`Message received: ${JSON.stringify(msg, null, 2)}`);
    setIsLayoutEditable(!!msg.message);
  });

  const handleLayoutChange = (newLayout) => {
    console.log("bruh", JSON.stringify(newLayout, null, 2));
    setLayout(newLayout);
    // save the new layout to local storage
    localStorage.setItem(
      "engine-page-layout",
      JSON.stringify(newLayout, null, 2)
    );
  };

  const handleWidthChange = ({ containerWidth }) => {
    console.log(containerWidth);
  };

  const handleBreakpointChange = () => {
    console.log("breakpoint changed");
    toast.info("breakpoint changed");
  };

  return (
    <div className="flex flex-col">
      {shouldToolbarBeVisible && (
        <div className="flex justify-center w-full mb-4">
          <Toolbar />
        </div>
      )}
      <div>
        <ResponsiveGridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={30}
          breakpoints={breakpoints}
          width={rglContainerWidth} // TODO: find a better way to get screen width?
          isDraggable={isLayoutEditable}
          isResizable={isLayoutEditable}
          onLayoutChange={handleLayoutChange}
          allowOverlap={false}
          onWidthChange={handleWidthChange}
          onBreakpointChange={handleBreakpointChange}
        >
          <div key="a" className="bg-base-200">
            a
          </div>
          <div key="b" className="bg-base-200">
            b
          </div>
          <div key="c" className="bg-base-200">
            c
          </div>
          <div key="d" className="bg-base-200">
            a
          </div>
          <div key="e" className="bg-base-200">
            b
          </div>
          <div key="f" className="bg-base-200">
            c
          </div>
        </ResponsiveGridLayout>
      </div>
    </div>
  );
}

export default Engine;
