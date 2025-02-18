// src/components/Loader.jsx
import { motion } from "motion/react";

export default function Keyframes() {
  return (
    <motion.div
      className="w-24 h-24 bg-gray-100 rounded"
      animate={{
        scale: [1, 2, 2, 1, 1],
        rotate: [0, 0, 180, 180, 0],
        borderRadius: ["0%", "0%", "50%", "50%", "0%"],
      }}
      transition={{
        duration: 2,
        ease: "easeInOut",
        times: [0, 0.2, 0.5, 0.8, 1],
        repeat: Infinity,
        repeatDelay: 1,
      }}
    />
  );
}
