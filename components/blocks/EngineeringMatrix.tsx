"use client";

import { motion, Variants } from "framer-motion";
import { Hammer, Waves, Cpu, ShieldCheck } from "lucide-react";

export function EngineeringMatrix() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section id="engineering" className="py-20 px-4 sm:px-6 border-t border-white/[0.08] bg-[#0A0B0E]">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#12141C] border border-white/[0.12] mb-2 font-mono text-[10px] text-[#FF4400] font-bold uppercase tracking-wider">
            <span>PRECISION SPECIFICATION // ISO-9001</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight uppercase">
            ENGINEERING MATRIX
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed font-sans">
            Every curve, chamfer, and internal resonant cavity is calculated through finite element acoustic resonance simulation to eliminate harsh harmonic pinging.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          <motion.div variants={cardVariants} className="p-5 rounded-xl bg-[#0E1016] border border-white/[0.08] hover:border-[#FF4400]/50 transition-colors group">
            <div className="flex items-center justify-between mb-3 font-mono">
              <div className="w-9 h-9 rounded-lg bg-[#FF4400]/10 text-[#FF4400] border border-[#FF4400]/25 flex items-center justify-center">
                <Hammer className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-[#FF4400] uppercase font-bold">
                ±0.02mm
              </span>
            </div>
            <h3 className="font-mono font-bold text-white text-sm tracking-tight uppercase">01 // CNC 6063 BILLET</h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-sans">
              Milled from a single 4.8kg aerospace billet with micron-grade tolerances and bead-blasted 180-grit micro texture.
            </p>
          </motion.div>

          <motion.div variants={cardVariants} className="p-5 rounded-xl bg-[#0E1016] border border-white/[0.08] hover:border-[#00F0FF]/50 transition-colors group">
            <div className="flex items-center justify-between mb-3 font-mono">
              <div className="w-9 h-9 rounded-lg bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/25 flex items-center justify-center">
                <Waves className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-[#00F0FF] uppercase font-bold">
                DUAL GASKET
              </span>
            </div>
            <h3 className="font-mono font-bold text-white text-sm tracking-tight uppercase">02 // PORON & IXPE</h3>
            <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-sans">
              Dual silicone gaskets coupled with custom die-cut Poron switch pads for an ultra-deep, marble acoustic profile.
            </p>
          </motion.div>

          <motion.div variants={cardVariants} className="p-5 rounded-xl bg-[#0E1016] border border-white/[0.08] hover:border-[#FF9500]/50 transition-colors group">
            <div className="flex items-center justify-between mb-3 font-mono">
              <div className="w-9 h-9 rounded-lg bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/25 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-[#FF9500] uppercase font-bold">
                0.125ms
              </span>
            </div>
            <h3 className="font-mono font-bold text-white text-sm tracking-tight uppercase">03 // 1000Hz CORTEX</h3>
            <p className="text-xs text-neutral-400 mt-2.5 leading-relaxed font-sans">
              Zero-latency Arm Cortex-M4 microcontroller running full open-source VIA and QMK key remapping with zero driver bloat.
            </p>
          </motion.div>

          <motion.div variants={cardVariants} className="p-5 rounded-xl bg-[#0E1016] border border-white/[0.08] hover:border-[#00E575]/50 transition-colors group">
            <div className="flex items-center justify-between mb-3 font-mono">
              <div className="w-9 h-9 rounded-lg bg-[#00E575]/10 text-[#00E575] border border-[#00E575]/25 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] text-[#00E575] uppercase font-bold">
                CERTIFIED
              </span>
            </div>
            <h3 className="font-mono font-bold text-white text-sm tracking-tight uppercase">04 // LIFELONG SUPPORT</h3>
            <p className="text-xs text-neutral-400 mt-2.5 leading-relaxed font-sans">
              Each unit includes an engraved serial certificate of authenticity and lifelong hot-swap replacement PCB support.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
