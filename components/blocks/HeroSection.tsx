"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { acousticEngine } from "@/lib/acoustics/engine";
import { ArrowDown, ArrowUpRight, Cpu, Layers, Volume2 } from "lucide-react";
import { MagneticElement } from "@/components/ui/MagneticElement";
import { motion, useScroll, useTransform } from "framer-motion";

export function HeroSection() {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={containerRef} className="relative min-h-[92vh] bg-[#090A0D] text-white overflow-hidden pt-28 pb-16 px-4 sm:px-6 flex flex-col justify-center border-b border-white/[0.08]">
      {/* Precision Dot-Matrix Grid Background - 0% CPU overhead */}
      <div className="absolute inset-0 bg-dot-matrix pointer-events-none opacity-40" />

      {/* Crosshair Corner Markers */}
      <div className="absolute top-24 left-6 font-mono text-[10px] text-neutral-600 pointer-events-none select-none">
        + 00.00.01
      </div>
      <div className="absolute top-24 right-6 font-mono text-[10px] text-neutral-600 pointer-events-none select-none">
        + 99.99.99
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* Left: Raw Industrial Typography & Schematics */}
        <div className="max-w-2xl flex flex-col gap-5">
          {/* Engineering Pill Badge */}
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-md bg-[#12141C] border border-white/[0.12] w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4400] animate-pulse" />
            <span className="font-mono text-[10px] tracking-widest text-[#FF4400] uppercase font-bold">
              SYS.SPEC // 2026-REV.4
            </span>
            <span className="text-neutral-700 font-mono text-xs">•</span>
            <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">
              RAW BILLET BILATERAL CHASSIS
            </span>
          </div>

          {/* Primary Punchy Monolith Headline */}
          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
            }}
            className="font-display text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.92] text-white uppercase"
          >
            <div className="overflow-hidden">
              <motion.span 
                variants={{
                  hidden: { y: "100%" },
                  visible: { y: 0, transition: { type: "spring", damping: 30, stiffness: 200 } }
                }}
                className="inline-block"
              >
                ENGINEERED
              </motion.span>
            </div>
            <div className="overflow-hidden">
              <motion.span 
                variants={{
                  hidden: { y: "100%" },
                  visible: { y: 0, transition: { type: "spring", damping: 30, stiffness: 200 } }
                }}
                className="inline-block"
              >
                <span className="text-[#FF4400]">TACTILE</span> MONOLITH
              </motion.span>
            </div>
          </motion.h1>

          {/* Engineering Narrative */}
          <p className="text-sm sm:text-base text-neutral-400 font-sans leading-relaxed max-w-xl">
            Milled from a solid 4.8kg aerospace 6063 aluminum block. Zero-tolerance gasket suspension, mirror PVD brass counterweights, and uncompressed acoustic dampening.
          </p>

          {/* Technical Specs Ruler Row */}
          <div className="grid grid-cols-3 gap-3 py-3 border-y border-white/[0.08] font-mono">
            <div>
              <span className="text-[10px] text-neutral-500 block">BILLET TOLERANCE</span>
              <span className="text-xs text-white font-bold tracking-tight">±0.02mm CNC</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block">TOTAL MASS</span>
              <span className="text-xs text-[#FF4400] font-bold tracking-tight">2,450g MASS</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 block">CONTROLLER</span>
              <span className="text-xs text-white font-bold tracking-tight">1000Hz ARM-M4</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2 z-20">
            <MagneticElement strength={0.2} cursorText="LAUNCH">
              <Link href="/studio/customizer">
                <button
                  onClick={() => acousticEngine.playTactileClick("relay")}
                  className="px-6 py-3.5 rounded-lg bg-[#FF4400] hover:bg-[#FF5511] text-black font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(255,68,0,0.35)] hover:shadow-[0_0_35px_rgba(255,68,0,0.5)] transition-all flex items-center gap-2 active:translate-y-0.5"
                >
                  <Layers className="w-4 h-4" />
                  <span>INITIATE 3D WORKSHOP</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </Link>
            </MagneticElement>

            <MagneticElement strength={0.1}>
              <a href="#collection">
                <button
                  onClick={() => acousticEngine.playTactileClick("click")}
                  className="px-5 py-3.5 rounded-lg bg-[#14161F] hover:bg-[#1C202B] border border-white/[0.12] hover:border-white/30 text-white font-mono text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
                >
                  <span>EXPLORE BINS</span>
                </button>
              </a>
            </MagneticElement>

            <a href="#acoustics">
              <button
                onClick={() => acousticEngine.playTactileClick("click")}
                className="px-4 py-3.5 rounded-lg bg-transparent hover:bg-white/[0.04] text-neutral-400 hover:text-white font-mono text-xs transition-colors flex items-center gap-1.5"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#FF4400]" />
                <span>SOUND FFT</span>
              </button>
            </a>
          </div>
        </div>

        {/* Right: Nothing Tech Style Transparent Chassis Stage */}
        <motion.div 
          style={{ y: parallaxY, opacity: opacityFade }}
          className="w-full lg:max-w-xl"
        >
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative rounded-2xl bg-[#0E1016] border border-white/[0.12] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 hover:border-[#FF4400]/50"
          >
            {/* Top Telemetry Strip */}
            <div className="flex items-center justify-between font-mono text-[10px] text-neutral-500 pb-3 border-b border-white/[0.06] mb-3">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E575]" />
                UNIT // AURA-TITAN-65
              </span>
              <span className="text-[#FF4400]">CHASSIS: ANODIZED OBSIDIAN</span>
            </div>

            {/* High-Resolution Hardware Photography */}
            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-black border border-white/[0.06]">
              <Image
                src="/images/products/titan-65.jpg"
                alt="Aura Titan-65 CNC Mechanical Keyboard"
                fill
                priority
                className={`object-cover object-center transition-transform duration-500 ${
                  isHovered ? "scale-105" : "scale-100"
                }`}
                sizes="(max-width: 1200px) 100vw, 600px"
              />

              {/* Technical Measurement Overlay Tag */}
              <div className="absolute top-3 right-3 px-2 py-1 rounded bg-black/80 border border-white/[0.1] font-mono text-[10px] text-neutral-300">
                SCALE 1:1
              </div>

              {/* Bottom Spec Pills */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] text-neutral-400 bg-black/75 backdrop-blur-sm p-2 rounded-lg border border-white/[0.08]">
                <span>PVD BRASS WEIGHT: 1.2KG</span>
                <span className="text-[#00E575]">QMK / VIA VERIFIED</span>
              </div>
            </div>

            {/* Bottom Bar: Schematic Barcode Stamp */}
            <div className="flex items-center justify-between pt-3 font-mono text-[9px] text-neutral-500">
              <span>||| | | || ||| || ||| | 00492</span>
              <span>CALIBRATED FOR PURISTS</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
