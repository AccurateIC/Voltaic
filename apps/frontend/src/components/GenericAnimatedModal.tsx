import { motion, AnimatePresence } from "motion/react";
import { useEffect, KeyboardEvent } from "react";

interface GraphModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const GenericAnimatedModal = ({ isOpen, onClose, children }: GraphModalProps) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) onClose();
    };

    (window as any).addEventListener("keydown", handleEsc);

    return () => {
      (window as any).removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-[120] cursor-pointer"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="fixed inset-2 md:inset-10 lg:inset-20 z-[130] bg-base-200 rounded-lg overflow-hidden flex flex-col"
          >
            <button onClick={onClose} className="absolute top-4 right-4 btn btn-circle btn-ghost">
              ✕
            </button>
            <div className="w-full h-full p-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
