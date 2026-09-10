"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { useCursorStore } from "@/store/useCursorStore";

interface MagneticElementProps {
  children: React.ReactNode;
  strength?: number; // How far the element pulls (e.g. 0.2 means it moves 20% toward the cursor)
  className?: string;
  cursorText?: string;
}

export function MagneticElement({ 
  children, 
  strength = 0.2, 
  className = "",
  cursorText
}: MagneticElementProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { setVariant, setText } = useCursorStore();

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    
    setPosition({ x: middleX * strength, y: middleY * strength });
  };

  const reset = () => {
    setPosition({ x: 0, y: 0 });
    setVariant("default");
    setText("");
  };

  const handleMouseEnter = () => {
    if (cursorText) {
      setVariant("drag");
      setText(cursorText);
    } else {
      setVariant("hover");
    }
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      onMouseEnter={handleMouseEnter}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={`relative inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}
