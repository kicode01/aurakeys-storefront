"use client";

import Link from "next/link";
import { ArrowUpRight, Layers } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function FeatureBanner() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const badgeY = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <motion.section 
      ref={containerRef}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="px-4 sm:px-6 py-12 max-w-7xl mx-auto w-full"
    >
      <div className="relative rounded-2xl overflow-hidden bg-[#0E1016] p-6 sm:p-12 border border-white/[0.12] flex flex-col lg:flex-row items-center justify-between gap-8 shadow-[0_15px_40px_rgba(0,0,0,0.8)] group">
        {/* Dot-matrix subtle texture */}
        <div className="absolute inset-0 bg-dot-matrix pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity duration-700" />

        {/* Corner Bolts */}
        <div className="absolute top-3 left-3 font-mono text-[10px] text-neutral-600 select-none">⊕</div>
        <div className="absolute top-3 right-3 font-mono text-[10px] text-neutral-600 select-none">⊕</div>

        <div className="max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#FF4400]/15 border border-[#FF4400]/30 text-[#FF4400] font-mono text-[10px] font-bold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4400]" />
            3D CAD WORKSHOP // 60 FPS
          </div>
          <h3 className="text-3xl sm:text-4xl font-black font-display text-white tracking-tight leading-tight uppercase">
            REAL-TIME HARDWARE FORGE
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2.5 leading-relaxed font-sans">
            Enter the WebGL CAD lab. Freely rotate and inspect raw billet anodization finishes, test plate acoustic damping harmonics, and actuate exploded mechanical teardown layers at 60 FPS.
          </p>

          {/* Micro Feature Specs */}
          <div className="grid grid-cols-3 gap-2 my-5 pt-3 border-t border-white/[0.08] font-mono">
            <div>
              <span className="text-[10px] text-neutral-500 block">PIPELINE</span>
              <span className="text-xs text-[#FF4400] font-bold">WebGL 2.0 PBR</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block">METRICS</span>
              <span className="text-xs text-white font-bold">1:1 CAD Scale</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block">TEARDOWN</span>
              <span className="text-xs text-[#00E575] font-bold">Exploded View</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <Link href="/studio/customizer">
              <button className="px-6 py-3 rounded-lg bg-[#FF4400] hover:bg-[#FF5511] text-black font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,68,0,0.35)] transition-all flex items-center gap-2 active:translate-y-0.5">
                LAUNCH 3D WORKSHOP
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </Link>
            <span className="text-[11px] font-mono text-neutral-500">
              Zero Plugins Required • Hardware Accel
            </span>
          </div>
        </div>

        {/* Right Visual Badge Card (with Parallax) */}
        <motion.div 
          style={{ y: badgeY }}
          className="z-10 flex flex-col items-center gap-3 p-6 rounded-xl bg-[#14161F] border border-white/[0.1] min-w-[260px] text-center font-mono"
        >
          <div className="w-16 h-16 rounded-xl bg-black border border-[#FF4400]/40 flex items-center justify-center text-[#FF4400] shadow-[0_0_25px_rgba(255,68,0,0.2)]">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <p className="font-bold text-white text-sm tracking-tight uppercase">EXPLODED MATRIX</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">6-Layer Mechanical Gasket Stack</p>
          </div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-[#00E575]/10 border border-[#00E575]/20 text-[#00E575] text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E575] animate-ping" />
            SHADERS ACTIVE 60Hz
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
