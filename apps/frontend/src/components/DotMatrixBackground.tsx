import { useRef, useEffect } from "react";
import { motion, animate } from "motion/react";

interface Dot {
  x: number;
  y: number;
  opacity: number;
  scale: number;
  initialX: number;
  initialY: number;
}

interface DotMatrixBackgroundProps {
  className?: string;
}

const DotMatrixBackground = ({ className }: DotMatrixBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number>();

  // Configuration
  const DOT_SIZE = 3;
  const DOT_SPACING = 30;
  const INTERACTION_RADIUS = 180;
  const BASE_OPACITY = 0.4;
  const HOVER_OPACITY = 1.0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let currentDots: Dot[] = [];
    let currentMousePos = { x: 0, y: 0 };

    const resizeCanvas = () => {
      // Use window dimensions for full screen coverage
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      // Generate dots based on canvas size
      const newDots: Dot[] = [];
      const cols = Math.floor(width / DOT_SPACING);
      const rows = Math.floor(height / DOT_SPACING);

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * DOT_SPACING + DOT_SPACING / 2;
          const y = j * DOT_SPACING + DOT_SPACING / 2;
          newDots.push({
            x,
            y,
            opacity: BASE_OPACITY + Math.random() * 0.1,
            scale: 0.8 + Math.random() * 0.4,
            initialX: x,
            initialY: y,
          });
        }
      }
      currentDots = newDots;
    };

    const handleMouseMove = (e: MouseEvent) => {
      currentMousePos = { x: e.clientX, y: e.clientY };
    };

    const drawDots = () => {
      if (!ctx || !canvas) return;

      // Fill background with solid DaisyUI base color
      ctx.fillStyle = "rgba(26, 26, 26, 1)"; // base-200 equivalent
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      currentDots.forEach((dot) => {
        const distance = Math.sqrt(Math.pow(dot.x - currentMousePos.x, 2) + Math.pow(dot.y - currentMousePos.y, 2));

        let opacity = dot.opacity;
        let scale = dot.scale;
        let x = dot.x;
        let y = dot.y;

        if (distance < INTERACTION_RADIUS) {
          const influence = 1 - distance / INTERACTION_RADIUS;
          opacity = Math.min(HOVER_OPACITY, dot.opacity + influence * 0.6);
          scale = dot.scale + influence * 0.5;

          // Gentle repulsion effect
          const angle = Math.atan2(dot.y - currentMousePos.y, dot.x - currentMousePos.x);
          const repulsion = influence * 8;
          x = dot.initialX + Math.cos(angle) * repulsion;
          y = dot.initialY + Math.sin(angle) * repulsion;
        } else {
          // Smoothly return to original position
          x = dot.initialX + (dot.x - dot.initialX) * 0.95;
          y = dot.initialY + (dot.y - dot.initialY) * 0.95;
        }

        // Update dot position for next frame
        dot.x = x;
        dot.y = y;

        // Draw dot
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = `rgba(140, 140, 140, ${opacity})`; // base-content muted
        ctx.beginPath();
        ctx.arc(x, y, DOT_SIZE * scale, 0, Math.PI * 2);
        ctx.fill();

        // Add glow effect for interactive dots
        if (distance < INTERACTION_RADIUS) {
          ctx.globalAlpha = opacity * 0.4;
          ctx.fillStyle = `rgba(65, 105, 225, ${opacity * 0.6})`; // primary color glow
          ctx.beginPath();
          ctx.arc(x, y, DOT_SIZE * scale * 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationIdRef.current = requestAnimationFrame(drawDots);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    document.addEventListener("mousemove", handleMouseMove);

    // Start animation loop
    drawDots();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("mousemove", handleMouseMove);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  // Subtle floating animation on component mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    animate(canvas, { opacity: [0, 1] }, { duration: 1.5, ease: "easeOut" });
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      style={{ zIndex: 1 }}
    />
  );
};

export default DotMatrixBackground;
