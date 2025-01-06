// src/pages/Engine.jsx
import { useState } from "react";
import GridLayout from "react-grid-layout";
import { ChartArea, Pencil, Radar, Sailboat } from "lucide-react";

function Toolbar() {
  return (
    <ul className="menu menu-horizontal rounded-box bg-base-300">
      <li>
        <a
          className="tooltip tooltip-bottom menu-active"
          data-tip="Edit Layout"
        >
          <Pencil />
        </a>
      </li>
      <li>
        <a className="tooltip tooltip-bottom" data-tip="New Chart">
          <ChartArea />
        </a>
      </li>
      <li>
        <a className="tooltip tooltip-bottom" data-tip="Radar">
          <Radar />
        </a>
      </li>
      <li>
        <a className="tooltip tooltip-bottom" data-tip="Sailboat">
          <Sailboat />
        </a>
      </li>
    </ul>
  );
}

function Engine() {
  const layout = [
    { i: "a", x: 0, y: 0, w: 1, h: 2, static: true },
    { i: "b", x: 1, y: 0, w: 3, h: 2, minW: 2, maxW: 4 },
    { i: "c", x: 4, y: 0, w: 1, h: 2 },
  ];
  const [shouldToolbarBeVisible, setShouldToolbarBeVisible] = useState(true);

  return (
    <div className="flex flex-col">
      {shouldToolbarBeVisible && (
        <div className="flex justify-center w-full mb-4">
          <Toolbar />
        </div>
      )}
      <div>
        <GridLayout
          className="layout"
          layout={layout}
          cols={12}
          rowHeight={30}
          width={1200}
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
        </GridLayout>
      </div>
    </div>
  );
}

export default Engine;
