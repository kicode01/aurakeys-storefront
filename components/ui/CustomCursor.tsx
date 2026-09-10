"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCursorStore } from "@/store/useCursorStore";

export function CustomCursor() {
  const { variant, text } = useCursorStore();
  const [isVisible, setIsVisible] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  // Tighter spring config for zero perceived lag
  const springConfig = { damping: 40, stiffness: 1000, mass: 0.05 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", moveCursor);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cursorX, cursorY]);

  // Handle variants
  let size = 12;
  let opacity = isVisible ? 1 : 0;
  let bg = "bg-[#FF4400]";
  let mixBlend = "mix-blend-normal";
  
  if (variant === "hover") {
    size = 48;
    bg = "bg-white/10 backdrop-blur-sm border border-white/20";
  } else if (variant === "drag") {
    size = 64;
    bg = "bg-[#FF4400]/20 backdrop-blur-md border border-[#FF4400]/50 text-[#FF4400]";
  } else if (variant === "hidden") {
    opacity = 0;
  }

  // Prevent rendering on mobile/touch devices where cursor is irrelevant
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
    return null;
  }

  return (
    <motion.div
      style={{
        translateX: smoothX,
        translateY: smoothY,
        x: "-50%",
        y: "-50%",
        opacity,
      }}
      animate={{
        width: size,
        height: size,
      }}
      transition={{ type: "spring", damping: 25, stiffness: 400, mass: 0.2 }}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] rounded-full flex items-center justify-center overflow-hidden transition-colors duration-300 ${bg} ${mixBlend}`}
    >
      {text && (
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-[9px] font-mono font-bold tracking-widest whitespace-nowrap"
        >
          {text}
        </motion.span>
      )}
    </motion.div>
  );
}
