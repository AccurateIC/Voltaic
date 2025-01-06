// src/components/Toolbar.jsx

import { ChartArea, Pencil, Radar, Sailboat } from "lucide-react";
import { useMessageBus } from "../lib/MessageBus";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

export function Toolbar() {
  const [editable, setEditable] = useState(false);
  const publishToMessageBus = useMessageBus("edit-layout");

  function onEditClick() {
    setEditable((prevEditMode) => !prevEditMode);
  }

  useEffect(() => {
    // send a message on the message bus that edit mode has been toggled
    publishToMessageBus({ time: Date.now(), message: editable });
  }, [editable, publishToMessageBus]);

  return (
    <>
      <Toaster richColors={true} />
      <ul className={`menu menu-horizontal rounded-box bg-base-300`}>
        <li key="edit-layout">
          <a
            className={`tooltip tooltip-bottom ${
              editable ? "menu-active" : ""
            }`}
            data-tip="Edit layout"
            onClick={onEditClick}
          >
            <Pencil />
          </a>
        </li>

        <li key="new-chart">
          <a className="tooltip tooltip-bottom" data-tip="Create new chart">
            <ChartArea />
          </a>
        </li>

        <li key="radar">
          <a className="tooltip tooltip-bottom" data-tip="Radar">
            <Radar />
          </a>
        </li>

        <li key="sailboat">
          <a className="tooltip tooltip-bottom" data-tip="Sailboat">
            <Sailboat />
          </a>
        </li>
      </ul>
    </>
  );
}
