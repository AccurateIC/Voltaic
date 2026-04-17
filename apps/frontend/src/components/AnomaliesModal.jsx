// frontend/src/components/AnomaliesModal.jsx
import { useState } from "react";
import { toast } from "sonner";

export const AnomaliesModal = ({ isOpen, unresolved, resolved, onClose, onClear }) => {
  const [isClearing, setIsClearing] = useState(false);

  const handleClear = async (period) => {
    setIsClearing(true);
    try {
      await onClear(period);
    } catch (error) {
      
      toast.error("Failed to clear records");
    } finally {
      setIsClearing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Anomaly Alerts</h2>

        {/* Counts */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-red-100 p-4 rounded">
            <p className="text-sm text-gray-600">🔴 UNRESOLVED</p>
            <p className="text-3xl font-bold">{unresolved}</p>
            <p className="text-xs text-gray-500">(New alerts)</p>
          </div>

          <div className="bg-green-100 p-4 rounded">
            <p className="text-sm text-gray-600">✅ RESOLVED</p>
            <p className="text-3xl font-bold">{resolved}</p>
            <p className="text-xs text-gray-500">(Completed)</p>
          </div>
        </div>

        {/* Clear Buttons */}
        <p className="font-semibold mb-3">Clear Resolved Records:</p>
        <div className="flex gap-2 flex-wrap">
          <button
            className="btn btn-sm btn-outline"
            onClick={() => handleClear("1day")}
            disabled={isClearing}
          >
            {isClearing ? "Clearing..." : "Clear 1 Day"}
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => handleClear("1week")}
            disabled={isClearing}
          >
            {isClearing ? "Clearing..." : "Clear 1 Week"}
          </button>
          <button
            className="btn btn-sm btn-outline"
            onClick={() => handleClear("1month")}
            disabled={isClearing}
          >
            {isClearing ? "Clearing..." : "Clear 1 Month"}
          </button>
        </div>

        {/* Close Button */}
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};