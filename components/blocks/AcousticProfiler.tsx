"use client";

import { useEffect, useRef, useState } from "react";
import {
  acousticEngine,
  SwitchProfile,
  PlateMaterial,
} from "@/lib/acoustics/engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Volume2, Sparkles, Activity, Keyboard as KeyboardIcon } from "lucide-react";
import { motion } from "framer-motion";

export function AcousticProfiler() {
  const [profile, setProfile] = useState<SwitchProfile>("thock");
  const [plate, setPlate] = useState<PlateMaterial>("brass");
  const [volume, setVolume] = useState<number>(0.8);
  const [lastKey, setLastKey] = useState<string>("Space");
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Trigger keystroke sound
  const triggerSound = (keyLabel: string = "Space") => {
    setLastKey(keyLabel);
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 120);
    acousticEngine.playKeystroke({ profile, plate, volume });
  };

  // Keyboard listener to let the user type on their real keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid capturing when in an input or textarea, or if the key is held down (auto-repeat)
      if (
        e.repeat ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      triggerSound(e.key.length === 1 ? e.key.toUpperCase() : e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [profile, plate, volume]);

  // IntersectionObserver to pause canvas animation when not in viewport (Eliminates CPU/GPU scroll lag!)
  const sectionRef = useRef<HTMLElement>(null);
  const isVisibleRef = useRef<boolean>(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Real-time Oscilloscope animation - pauses when offscreen!
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      // If section is scrolled out of view, sleep and consume 0% CPU!
      if (!isVisibleRef.current) {
        animationId = requestAnimationFrame(render);
        return;
      }

      const analyser = acousticEngine.analyser;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // CRT Phosphor Grid Lines
      ctx.strokeStyle = "rgba(0, 229, 117, 0.08)";
      ctx.lineWidth = 1;
      // Horizontal center
      ctx.beginPath();
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Vertical grid ticks
      for (let x = 40; x < canvas.width; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      if (analyser) {
        const bufferLength = analyser.frequencyBinCount;
        const timeDataArray = new Uint8Array(bufferLength);
        const freqDataArray = new Uint8Array(bufferLength);
        
        analyser.getByteTimeDomainData(timeDataArray);
        analyser.getByteFrequencyData(freqDataArray);

        // 1. Draw FFT Frequency Bars
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barX = 0;
        
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (freqDataArray[i] / 255) * canvas.height;
          
          // Gradient based on frequency intensity
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
          gradient.addColorStop(0, "rgba(255, 68, 0, 0.1)");
          gradient.addColorStop(1, "rgba(255, 68, 0, 0.6)");
          
          ctx.fillStyle = gradient;
          ctx.fillRect(barX, canvas.height - barHeight, barWidth - 1, barHeight);
          
          barX += barWidth;
        }

        // 2. Draw Oscilloscope Waveform
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#00E575"; // Phosphor green
        ctx.shadowColor = "rgba(0, 229, 117, 0.6)";
        ctx.shadowBlur = 6;
        ctx.beginPath();

        const sliceWidth = (canvas.width * 1.0) / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = timeDataArray[i] / 128.0;
          const y = (v * canvas.height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
          x += sliceWidth;
        }

        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="acoustics"
      className="py-20 px-4 sm:px-6 max-w-7xl mx-auto border-t border-white/[0.08]"
    >
      <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#12141C] border border-white/[0.12] mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E575] animate-pulse" />
          <span className="font-mono text-[10px] tracking-widest text-[#00E575] uppercase font-bold">
            DSP ACOUSTIC SYNTHESIZER
          </span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight uppercase">
          RESONANCE LABORATORY
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed font-sans">
          Type on your physical computer keyboard or strike the switch below to preview harmonics, housing slap, and internal plate reverberation in real time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Configuration Controls */}
        <div className="lg:col-span-5 flex flex-col gap-5 p-6 rounded-xl bg-[#0E1016] border border-white/[0.08] relative">
          {/* Switch Profile selection */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#FF4400] block mb-2.5 font-bold">
              SWITCH STEM PROFILE
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "thock", name: "Tactile 67g", tag: "Deep Thock" },
                { id: "clack", name: "Linear Oil King", tag: "Crisp Clack" },
                { id: "clicky", name: "Bespoke Clicky", tag: "Click Bar" },
                { id: "silent", name: "Silent Stealth", tag: "Dampened" },
              ].map((sw) => (
                <button
                  key={sw.id}
                  onClick={() => {
                    acousticEngine.playTactileClick("click");
                    setProfile(sw.id as SwitchProfile);
                  }}
                  className={`p-3 rounded-lg border text-left transition-colors font-mono ${
                    profile === sw.id
                      ? "border-[#FF4400] bg-[#FF4400]/15 text-white"
                      : "border-white/[0.08] bg-[#14161F] text-neutral-300 hover:border-white/20"
                  }`}
                >
                  <p className="font-bold text-xs">{sw.name}</p>
                  <p className="text-[10px] text-[#FF4400] mt-0.5 font-semibold">
                    {sw.tag}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Plate Material */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-[#FF4400] block mb-2.5 font-bold">
              INTERNAL PLATE RESONANCE
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "brass", name: "Brass" },
                { id: "aluminum", name: "Alu 6063" },
                { id: "fr4", name: "FR4 Flex" },
                { id: "polycarbonate", name: "PC Sheet" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    acousticEngine.playTactileClick("click");
                    setPlate(p.id as PlateMaterial);
                  }}
                  className={`py-2 px-1 text-center rounded-lg border font-mono text-[11px] transition-colors ${
                    plate === p.id
                      ? "border-[#FF4400] bg-[#FF4400] text-black font-bold"
                      : "border-white/[0.08] bg-[#14161F] text-neutral-400 hover:text-white"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Volume Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5 font-mono">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-[#FF4400]" />
                AMPLITUDE
              </span>
              <span className="text-[11px] text-[#FF4400] font-bold">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full accent-[#FF4400] bg-black h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Physical Keyboard Prompt */}
          <div className="mt-auto p-3 rounded-lg bg-[#14161F] border border-white/[0.08] flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-black border border-white/[0.08] flex items-center justify-center text-[#00E575] flex-shrink-0">
              <KeyboardIcon className="w-4 h-4" />
            </div>
            <div className="text-xs font-mono">
              <p className="font-bold text-white text-[11px]">HARDWARE ACTUATION ON</p>
              <p className="text-neutral-500 text-[10px]">
                Physical keypress triggers real-time DSP audio.
              </p>
            </div>
          </div>
        </div>

        {/* Right: CRT Oscilloscope & Mechanical Keycap Trigger */}
        <div className="lg:col-span-7 flex flex-col justify-between p-6 rounded-xl bg-[#0E1016] border border-white/[0.08] relative">
          {/* Waveform Header */}
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] font-mono">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#00E575]" />
              <span className="text-xs uppercase tracking-wider text-white font-bold">
                CRT FFT OSCILLOSCOPE // 256 BINS
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-neutral-400">
              <span>KEY:</span>
              <span className="px-2 py-0.5 rounded bg-[#00E575]/15 text-[#00E575] border border-[#00E575]/30 font-bold">
                {lastKey}
              </span>
            </div>
          </div>

          {/* Canvas Waveform */}
          <div className="relative w-full h-40 my-3 rounded-lg bg-[#050608] border border-white/[0.08] overflow-hidden flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={640}
              height={160}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Interactive Mechanical Keycap Trigger */}
          <div className="flex flex-col items-center justify-center py-4">
            <button
              onClick={() => triggerSound("ACTUATE")}
              className={`w-44 h-28 rounded-xl bg-[#14161F] border-2 border-[#FF4400]/40 shadow-[0_8px_0_0_#090A0D] active:shadow-[0_2px_0_0_#090A0D] active:translate-y-1 flex flex-col items-center justify-center p-3 cursor-pointer transition-transform font-mono ${
                isPressing ? "border-[#FF4400] bg-[#FF4400]/10" : ""
              }`}
            >
              {/* Stem Indicator */}
              <div
                className={`w-6 h-6 rounded mb-1.5 flex items-center justify-center font-bold text-xs ${
                  profile === "thock"
                    ? "bg-[#FF9500] text-black"
                    : profile === "clack"
                    ? "bg-[#FF4400] text-white"
                    : profile === "clicky"
                    ? "bg-[#00F0FF] text-black"
                    : "bg-neutral-600 text-white"
                }`}
              >
                +
              </div>
              <span className="text-xs font-bold text-white tracking-widest uppercase">
                {isPressing ? "BOTTOM OUT" : "ACTUATE SWITCH"}
              </span>
              <span className="text-[9px] text-neutral-500 mt-1">
                4.0mm Travel • 2.0mm Actuation
              </span>
            </button>
            <p className="text-[10px] font-mono text-neutral-500 mt-3 tracking-wider">
              DSP GASKET DAMPENING CHAMBER
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
