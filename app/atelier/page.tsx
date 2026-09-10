"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Terminal, Crosshair, Layers, Volume2, ShieldCheck, ArrowDown } from "lucide-react";

export default function AtelierPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="bg-[#07080A] selection:bg-[#FF4400] selection:text-black font-sans relative">
      
      {/* Fixed Background Texture */}
      <div className="fixed inset-0 bg-dot-matrix pointer-events-none opacity-20 z-0" />

      {/* HERO SECTION */}
      <div ref={heroRef} className="relative h-screen flex flex-col items-center justify-center text-center z-0 px-6 border-b border-white/[0.08]">
        <motion.div 
          style={{ y: heroY, opacity: heroOpacity }}
          className="flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white font-mono text-[10px] tracking-widest font-bold mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#FF4400] animate-pulse" />
            AURAKEYS BRAND PHILOSOPHY
          </div>
          <h1 className="text-6xl sm:text-8xl md:text-[10rem] font-display font-black text-white uppercase tracking-tighter leading-[0.85] mix-blend-difference">
            UNCOMPROMISING <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-400 to-neutral-600">HARDWARE</span>
          </h1>
          <p className="mt-8 font-mono text-neutral-400 max-w-lg text-xs sm:text-sm leading-relaxed">
            We don't build keyboards. We precision-mill acoustic instruments from raw aerospace billet.
          </p>
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-12 flex flex-col items-center gap-3 text-neutral-500 font-mono text-[10px] tracking-widest"
        >
          COMMENCE TELEMETRY
          <ArrowDown className="w-4 h-4 text-[#FF4400]" />
        </motion.div>
      </div>

      {/* STICKY STACKING SECTIONS */}
      <div className="relative w-full z-10">
        
        {/* CHAPTER 1: THE BILLET */}
        <section className="sticky top-0 h-screen w-full bg-[#07080A] border-t border-white/[0.08] shadow-[0_-20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex items-center">
          {/* Giant Background Number */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/4 text-[40vw] font-display font-black text-white/[0.02] pointer-events-none select-none leading-none">
            01
          </div>
          
          <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }} variants={stagger}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
            >
              <div className="space-y-8">
                <motion.div variants={fadeUp}>
                  <div className="text-[#FF4400] font-mono text-[10px] tracking-widest font-bold mb-4">THE MILLING PROCESS</div>
                  <h2 className="text-5xl sm:text-7xl font-display font-black text-white uppercase tracking-tight">The 6063<br/>Billet</h2>
                </motion.div>
                <motion.p variants={fadeUp} className="text-neutral-400 leading-relaxed font-sans text-sm sm:text-base max-w-md">
                  Every chassis begins its life as a solid 4.8kg block of 6063-T6 aerospace aluminum. It undergoes 8 hours of 5-axis CNC machining, carving out precisely calculated acoustic chambers with a mirror-polished finish.
                </motion.p>
                <motion.div variants={fadeUp} className="flex gap-12 border-t border-white/[0.08] pt-8">
                  <div>
                    <div className="text-white font-mono text-3xl font-bold">8.5h</div>
                    <div className="text-neutral-500 font-mono text-[10px] uppercase mt-1">Machine Time</div>
                  </div>
                  <div>
                    <div className="text-white font-mono text-3xl font-bold">4.8kg</div>
                    <div className="text-neutral-500 font-mono text-[10px] uppercase mt-1">Raw Mass</div>
                  </div>
                </motion.div>
              </div>

              <motion.div variants={fadeUp} className="relative h-[60vh] w-full rounded-2xl overflow-hidden bg-black border border-white/[0.1] shadow-2xl group">
                <Image 
                  src="/images/products/titan-65.jpg" 
                  alt="Raw CNC Billet" 
                  fill 
                  className="object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end font-mono text-xs text-[#FF4400]">
                  <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded border border-[#FF4400]/30">
                    <Crosshair className="w-4 h-4" />
                    TOLERANCE: ±0.01mm
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CHAPTER 2: ACOUSTICS */}
        <section className="sticky top-0 h-screen w-full bg-[#0A0C10] border-t border-white/[0.08] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] overflow-hidden flex items-center">
          <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/4 text-[40vw] font-display font-black text-white/[0.02] pointer-events-none select-none leading-none">
            02
          </div>
          
          <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }} variants={stagger}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center"
            >
              <motion.div variants={fadeUp} className="order-2 lg:order-1 relative h-[60vh] w-full rounded-2xl overflow-hidden border border-[#00E575]/20 bg-[#050608] flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,229,117,0.05)]">
                <div className="absolute inset-0 flex items-center justify-center opacity-80">
                  <div className="w-full h-32 flex items-center justify-center gap-1.5 px-8">
                    {[...Array(40)].map((_, i) => (
                      <motion.div 
                        key={i}
                        animate={{ height: ["10%", `${Math.random() * 90 + 10}%`, "10%"] }}
                        transition={{ repeat: Infinity, duration: Math.random() * 1.5 + 0.5, ease: "easeInOut" }}
                        className="w-2 bg-gradient-to-t from-[#00E575]/10 to-[#00E575] rounded-full shadow-[0_0_15px_rgba(0,229,117,0.4)]"
                      />
                    ))}
                  </div>
                </div>
                <div className="relative z-10 mt-40 bg-black/60 backdrop-blur-md border border-[#00E575]/30 px-6 py-2 rounded-full font-mono text-xs font-bold text-[#00E575] tracking-widest uppercase">
                  [ DSP ENGINE ACTIVE ]
                </div>
              </motion.div>

              <div className="order-1 lg:order-2 space-y-8">
                <motion.div variants={fadeUp}>
                  <div className="text-[#00E575] font-mono text-[10px] tracking-widest font-bold mb-4">RESONANCE LABORATORY</div>
                  <h2 className="text-5xl sm:text-7xl font-display font-black text-white uppercase tracking-tight">Acoustic<br/>Dampening</h2>
                </motion.div>
                <motion.p variants={fadeUp} className="text-neutral-400 leading-relaxed font-sans text-sm sm:text-base max-w-md">
                  Sound is a physical science. We utilize custom-poured silicone gaskets and dense PORON memory foam to eliminate internal chassis ping, focusing purely on the deep, low-frequency switch signature.
                </motion.p>
                
                <motion.div variants={fadeUp} className="flex flex-col gap-4 pt-4">
                  <div className="bg-white/[0.02] border border-white/[0.08] p-4 rounded-xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#00E575]/10 flex items-center justify-center">
                      <Volume2 className="w-5 h-5 text-[#00E575]" />
                    </div>
                    <div>
                      <div className="text-white font-mono text-xs font-bold">FFT ISOLATION</div>
                      <div className="text-neutral-500 font-mono text-[10px]">Zero High-Frequency Ping</div>
                    </div>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.08] p-4 rounded-xl flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#FF4400]/10 flex items-center justify-center">
                      <Layers className="w-5 h-5 text-[#FF4400]" />
                    </div>
                    <div>
                      <div className="text-white font-mono text-xs font-bold">GASKET SUSPENSION</div>
                      <div className="text-neutral-500 font-mono text-[10px]">Silicone Plate Isolation</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CHAPTER 3: BRASS MATRIX */}
        <section className="sticky top-0 h-screen w-full bg-[#050505] border-t border-white/[0.08] shadow-[0_-20px_50px_rgba(0,0,0,0.9)] overflow-hidden flex items-center">
          <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-[50vw] font-display font-black text-white/[0.02] pointer-events-none select-none leading-none">
            03
          </div>
          
          <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: false, amount: 0.3 }} variants={stagger}
              className="flex flex-col items-center text-center"
            >
              <motion.div variants={fadeUp} className="text-[#E5B800] font-mono text-[10px] tracking-widest font-bold mb-4">
                PVD COUNTERWEIGHT
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-5xl sm:text-7xl md:text-8xl font-display font-black text-white uppercase tracking-tight mb-8">
                The Brass Matrix
              </motion.h2>
              <motion.p variants={fadeUp} className="text-neutral-400 leading-relaxed font-sans text-sm sm:text-base max-w-2xl mx-auto mb-16">
                Mass equals deep resonance. By integrating a 1.2kg solid brass bottom weight finished with a mirror PVD coating, we radically lower the keyboard's acoustic center of gravity.
              </motion.p>

              <motion.div variants={fadeUp} className="relative w-full max-w-5xl aspect-[21/9] rounded-3xl overflow-hidden border border-[#E5B800]/20 shadow-[0_0_100px_rgba(229,184,0,0.1)] group">
                 <Image 
                    src="/images/products/solaris-75.jpg" 
                    alt="Brass Weighting" 
                    fill 
                    className="object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />
              </motion.div>
            </motion.div>
          </div>
        </section>

      </div>
    </div>
  );
}
