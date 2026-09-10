"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import type { CustomizerConfig, ModelType, TeardownLayer } from "./Keyboard3DCanvas";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";

const Keyboard3DCanvas = dynamic(
  () => import("./Keyboard3DCanvas"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] flex flex-col items-center justify-center text-neutral-400 font-mono text-xs gap-3">
        <div className="w-8 h-8 rounded-none border-2 border-white/20 border-t-[#FF4400] animate-spin" />
        <span className="tracking-widest uppercase text-[#FF4400]">CALIBRATING 3D HARDWARE MATRIX...</span>
      </div>
    ),
  }
);

import { formatPrice } from "@/lib/utils";
import { acousticEngine, playTactileClick } from "@/lib/acoustics/engine";
import { Button } from "@/components/ui/button";
import {
  RotateCw,
  ShoppingBag,
  Volume2,
  Check,
  Layers,
  Cpu,
  SlidersHorizontal,
  Terminal,
  Save,
} from "lucide-react";

interface ModelInfo {
  id: ModelType;
  serial: string;
  name: string;
  tag: string;
  image: string;
  basePrice: number;
  baseWeight: number;
  description: string;
}

const MODELS: ModelInfo[] = [
  {
    id: "titan-65",
    serial: "ARCH-65",
    name: "Aura Titan-65",
    tag: "65% COMPACT BILLET",
    image: "/images/products/titan-65.jpg",
    basePrice: 485,
    baseWeight: 2450,
    description: "Solid CNC 6063 aluminum with mirror brass front bar and compact arrow cluster.",
  },
  {
    id: "solaris-75",
    serial: "ARCH-75",
    name: "Aura Solaris-75",
    tag: "75% ROTARY TELEMETRY",
    image: "/images/products/solaris-75.jpg",
    basePrice: 560,
    baseWeight: 2780,
    description: "Expanded F-row with stepped knurled brass rotary volume encoder and chamfered bezel.",
  },
  {
    id: "aegis-tkl",
    serial: "ARCH-87",
    name: "Aura Aegis TKL",
    tag: "87-KEY TKL ACOUSTIC",
    image: "/images/products/aegis-tkl.jpg",
    basePrice: 680,
    baseWeight: 3150,
    description: "Full tenkeyless monolith with 3x2 navigation island and deep brass acoustic chamber.",
  },
  {
    id: "nocturne-pad",
    serial: "NODE-12",
    name: "Aura Nocturne",
    tag: "12-KEY MACRO NODE",
    image: "/images/products/nocturne-pad.jpg",
    basePrice: 195,
    baseWeight: 780,
    description: "12-key ortholinear hot-swap matrix with oversized brass volume wheel and OLED display.",
  },
];

export function StudioCustomizer() {
  const searchParams = useSearchParams();
  const queryModel = searchParams.get("model") as ModelType | null;

  const [config, setConfig] = useState<CustomizerConfig>({
    model: queryModel && MODELS.some(m => m.id === queryModel) ? queryModel : "titan-65",
    caseFinish: "obsidian",
    keycapTheme: "midnight",
    weightFinish: "gold",
    knobFinish: "gold",
    autoRotate: false,
  });

  useEffect(() => {
    if (queryModel && MODELS.some(m => m.id === queryModel)) {
      setConfig(prev => prev.model === queryModel ? prev : { ...prev, model: queryModel });
    }
  }, [queryModel]);

  const [switchType, setSwitchType] = useState<"tactile" | "linear" | "clicky">("tactile");
  const [isAdded, setIsAdded] = useState(false);
  const [teardownLayer, setTeardownLayer] = useState<TeardownLayer>("none");
  const [isExploded, setIsExploded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  
  const { user, openLoginModal, saveBuild } = useAuthStore();
  const [isSaved, setIsSaved] = useState(false);

  const currentModel = MODELS.find((m) => m.id === config.model) || MODELS[0];

  const finishCost = {
    obsidian: 0,
    champagne: 45,
    silver: 25,
    titanium: 95,
  }[config.caseFinish];

  const weightCost = {
    gold: 55,
    gunmetal: 20,
    chromatic: 65,
  }[config.weightFinish];

  const switchCost = {
    tactile: 35,
    linear: 30,
    clicky: 25,
  }[switchType];

  const totalPrice = currentModel.basePrice + finishCost + weightCost + switchCost;
  const totalWeightGrams = currentModel.baseWeight + (config.weightFinish === "gold" ? 150 : 0);

  const handleAddToCart = () => {
    playTactileClick("relay");
    const customTitle = `${currentModel.name} [${config.caseFinish.toUpperCase()} / ${config.keycapTheme.toUpperCase()}]`;
    const customVariantTitle = `${switchType.toUpperCase()} • ${config.weightFinish.toUpperCase()} WEIGHT`;

    addItem({
      id: `bespoke-${Date.now()}`,
      productId: `gid://shopify/Product/${currentModel.id}`,
      variantId: `variant-bespoke-${currentModel.id}-${config.caseFinish}-${config.weightFinish}-${switchType}`,
      title: customTitle,
      variantTitle: customVariantTitle,
      price: totalPrice,
      currencyCode: "USD",
      image: currentModel.image,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      openCart();
    }, 1000);
  };

  const handleSaveToArchive = () => {
    if (!user) {
      acousticEngine.playTactileClick("click");
      openLoginModal();
      return;
    }

    acousticEngine.playTactileClick("relay");
    saveBuild({
      model: currentModel.name,
      caseColor: config.caseFinish,
      keycapColor: config.keycapTheme,
      switchType: switchType
    });

    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
    }, 2000);
  };

  const previewSwitchSound = () => {
    playTactileClick("click");
    const profileMap = {
      tactile: "thock",
      linear: "clack",
      clicky: "clicky",
    } as const;
    acousticEngine.playKeystroke({
      profile: profileMap[switchType],
      plate: "brass",
      volume: 0.85,
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Telemetry Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 pb-6 border-b border-white/[0.12] gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FF4400]/15 border border-[#FF4400]/40 text-[#FF4400] font-mono text-[10px] tracking-widest uppercase">
              <Terminal className="w-3 h-3" />
              TERMINAL // 3D-CAD-WORKSHOP v4.2
            </span>
            <span className="inline-flex items-center gap-1 text-[#00E575] font-mono text-[10px] tracking-widest uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E575] animate-pulse" />
              ONLINE 60Hz
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-mono font-bold text-white tracking-tight uppercase">
            BESPOKE WORKSHOP CAD ENGINE
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-mono max-w-2xl tracking-wide">
            REAL-TIME WEBGL HARDWARE ASSEMBLY • 6063-T6 BILLET ANODIZATION • ACOUSTIC RESONANCE CALIBRATION
          </p>
        </div>

        {/* Live specs summary */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono">
          <div className="bg-[#111318] px-3 py-2 border border-white/[0.12]">
            <span className="text-neutral-500 block text-[9px] uppercase tracking-wider">TOTAL MASS</span>
            <span className="text-white font-bold">{totalWeightGrams}g</span>
          </div>
          <div className="bg-[#111318] px-3 py-2 border border-white/[0.12]">
            <span className="text-neutral-500 block text-[9px] uppercase tracking-wider">TOLERANCE</span>
            <span className="text-[#00F0FF] font-bold">±0.005mm</span>
          </div>
          <div className="bg-[#111318] px-3 py-2 border border-white/[0.12]">
            <span className="text-neutral-500 block text-[9px] uppercase tracking-wider">LEAD TIME</span>
            <span className="text-[#00E575] font-bold">14D CNC</span>
          </div>
        </div>
      </div>

      {/* Model Selector Strip */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <label className="text-[11px] font-mono uppercase tracking-widest text-[#FF9500] flex items-center gap-2">
            <span>[ SYSTEM // SELECT CHASSIS ARCHITECTURE ]</span>
          </label>
          <span className="text-[10px] font-mono text-neutral-500">
            ACTIVE MATRIX: {currentModel.serial}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {MODELS.map((m) => {
            const isSelected = config.model === m.id;
            return (
              <button
                key={m.id}
                onClick={() => {
                  playTactileClick("toggle");
                  setConfig((prev) => {
                    let defaultCase = prev.caseFinish;
                    if (m.id === "titan-65") defaultCase = "obsidian";
                    else if (m.id === "solaris-75") defaultCase = "champagne";
                    else if (m.id === "aegis-tkl") defaultCase = "titanium";
                    else if (m.id === "nocturne-pad") defaultCase = "obsidian";

                    return {
                      ...prev,
                      model: m.id,
                      caseFinish: defaultCase,
                      weightFinish: "gold",
                      knobFinish: "gold",
                    };
                  });
                }}
                className={`p-3 text-left transition-all relative flex flex-col gap-2 border ${
                  isSelected
                    ? "border-[#FF4400] bg-[#FF4400]/10 shadow-[0_0_20px_rgba(255,68,0,0.18)] text-white"
                    : "border-white/[0.12] bg-[#111318] text-neutral-400 hover:border-white/30 hover:text-white"
                }`}
              >
                {/* Corner hex bolts */}
                <span className="absolute top-1 left-1.5 text-[8px] font-mono text-white/20 select-none">⊕</span>
                <span className="absolute top-1 right-1.5 text-[8px] font-mono text-white/20 select-none">⊕</span>

                {/* Thumbnail */}
                <div className="relative aspect-[16/9] w-full border border-white/10 bg-black overflow-hidden mt-1">
                  <Image
                    src={m.image}
                    alt={m.name}
                    fill
                    className="object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-1 left-1 px-1 py-0.2 bg-[#FF4400] text-black font-mono text-[9px] font-bold tracking-widest uppercase">
                      ACTIVE
                    </div>
                  )}
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <div>
                    <p className="font-mono font-bold text-xs text-white tracking-tight uppercase">{m.name}</p>
                    <p className="font-mono text-[9px] text-neutral-400">{m.tag}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#FF4400]">
                    {formatPrice(m.basePrice)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: 3D Canvas Left, Customizer Options Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* 3D Canvas Viewport */}
        <div className="lg:col-span-7 flex flex-col bg-[#0B0D12] border border-white/[0.14] relative min-h-[540px]">
          {/* Corner crosshairs */}
          <span className="absolute top-2 left-2 text-xs font-mono text-white/30 select-none z-20">+</span>
          <span className="absolute top-2 right-2 text-xs font-mono text-white/30 select-none z-20">+</span>
          <span className="absolute bottom-12 left-2 text-xs font-mono text-white/30 select-none z-20">+</span>
          <span className="absolute bottom-12 right-2 text-xs font-mono text-white/30 select-none z-20">+</span>

          {/* Canvas Controls Bar */}
          <div className="absolute top-3 left-6 z-20 flex items-center gap-2">
            <span className="font-mono text-[10px] text-neutral-400 tracking-wider uppercase bg-[#111318]/90 px-2 py-1 border border-white/10">
              CAD_VIEWPORT // {currentModel.serial}
            </span>
          </div>

          <div className="absolute top-3 right-6 z-20 flex items-center gap-2">
            <button
              onClick={() => {
                playTactileClick("toggle");
                const next = !isExploded;
                setIsExploded(next);
                setTeardownLayer(next ? "exploded" : "none");
              }}
              className={`px-2.5 py-1.5 border text-xs font-mono transition-all flex items-center gap-1.5 ${
                isExploded
                  ? "bg-[#FF4400] text-black border-[#FF4400] font-bold shadow-[0_0_15px_rgba(255,68,0,0.4)]"
                  : "bg-[#111318]/90 border-white/20 text-neutral-300 hover:text-white hover:border-white/40"
              }`}
              title="Toggle 3D Exploded Teardown View"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>TEARDOWN</span>
            </button>

            <button
              onClick={() => {
                playTactileClick("click");
                setConfig((prev) => ({ ...prev, autoRotate: !prev.autoRotate }));
              }}
              className={`px-2.5 py-1.5 border text-xs font-mono transition-all flex items-center gap-1.5 ${
                config.autoRotate
                  ? "bg-white/10 border-white/40 text-white"
                  : "bg-[#111318]/90 border-white/20 text-neutral-400 hover:text-white hover:border-white/40"
              }`}
              title="Toggle Orbit Auto-Rotation"
            >
              <RotateCw
                className={`w-3.5 h-3.5 ${config.autoRotate ? "animate-spin" : ""}`}
              />
              <span>ORBIT</span>
            </button>
          </div>

          {/* 3D WebGL Canvas Component */}
          <div className="w-full flex-1 relative flex items-center justify-center min-h-[520px]">
            <Keyboard3DCanvas
              config={{
                ...config,
                teardownLayer: isExploded ? "exploded" : teardownLayer,
                switchType: switchType,
              }}
            />
          </div>

          {/* Bottom Telemetry Bar */}
          <div className="p-3 border-t border-white/[0.12] bg-[#111318] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-neutral-400 gap-1 z-10">
            <div className="flex items-center gap-2">
              <span className="text-white font-bold uppercase">{currentModel.name}</span>
              <span className="text-neutral-600">//</span>
              <span className="text-[#FF9500]">{currentModel.description}</span>
            </div>
            <span className="text-neutral-500 shrink-0 text-[10px]">
              [ PITCH: 19.05mm • STROKE: 3.8mm ]
            </span>
          </div>
        </div>

        {/* Customization Options Control Enclosure */}
        <div className="lg:col-span-5 flex flex-col gap-5 p-5 sm:p-6 bg-[#111318] border border-white/[0.14] relative">
          {/* Corner Screws */}
          <span className="absolute top-2 left-2 text-[8px] font-mono text-white/20 select-none">⊕</span>
          <span className="absolute top-2 right-2 text-[8px] font-mono text-white/20 select-none">⊕</span>
          <span className="absolute bottom-2 left-2 text-[8px] font-mono text-white/20 select-none">⊕</span>
          <span className="absolute bottom-2 right-2 text-[8px] font-mono text-white/20 select-none">⊕</span>

          <div className="flex items-center justify-between border-b border-white/[0.10] pb-3">
            <span className="font-mono text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#FF4400]" />
              HARDWARE SPECIFICATION MATRIX
            </span>
            <span className="text-[10px] font-mono text-[#00E575]">LIVE_SYNC</span>
          </div>

          {/* Step 1: Chassis Anodization */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 flex items-center justify-between mb-2">
              <span>[ 01 // CNC CHASSIS FINISH ]</span>
              <span className="text-[#FF4400] font-bold">
                {config.caseFinish.toUpperCase()}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "obsidian", name: "Obsidian Black", price: "+$0" },
                { id: "champagne", name: "Champagne Gold", price: "+$45" },
                { id: "silver", name: "Nebula Silver", price: "+$25" },
                { id: "titanium", name: "Raw Titanium", price: "+$95" },
              ].map((c) => {
                const isSelected = config.caseFinish === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      playTactileClick("click");
                      setConfig((prev) => ({
                        ...prev,
                        caseFinish: c.id as CustomizerConfig["caseFinish"],
                        animTrigger: { type: "chassis_glint", id: Date.now() },
                      }));
                    }}
                    className={`p-2.5 border text-left transition-all ${
                      isSelected
                        ? "border-[#FF4400] bg-[#FF4400]/10 text-white shadow-[0_0_12px_rgba(255,68,0,0.25)]"
                        : "border-white/[0.12] bg-[#0A0B0E] text-neutral-400 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    <p className="font-mono font-bold text-xs">{c.name}</p>
                    <p className="text-[10px] font-mono text-neutral-500">{c.price}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Keycap Colorway */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 flex items-center justify-between mb-2">
              <span>[ 02 // KEYCAP MATRIX COLORWAY ]</span>
              <span className="text-[#FF4400] font-bold">
                {config.keycapTheme.toUpperCase()}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "midnight", name: "Midnight & Gold", desc: "Doubleshot PBT" },
                { id: "chalk", name: "Chalk Minimalist", desc: "Matte Monochrome" },
                { id: "cyber", name: "Cyberpunk Slate", desc: "Cyan Neon Mod" },
                { id: "emerald", name: "Emerald Atelier", desc: "Deep Forest" },
              ].map((k) => {
                const isSelected = config.keycapTheme === k.id;
                return (
                  <button
                    key={k.id}
                    onClick={() => {
                      playTactileClick("click");
                      setConfig((prev) => ({
                        ...prev,
                        keycapTheme: k.id as CustomizerConfig["keycapTheme"],
                        animTrigger: { type: "keycap_wave", id: Date.now() },
                      }));
                    }}
                    className={`p-2.5 border text-left transition-all ${
                      isSelected
                        ? "border-[#FF4400] bg-[#FF4400]/10 text-white shadow-[0_0_12px_rgba(255,68,0,0.25)]"
                        : "border-white/[0.12] bg-[#0A0B0E] text-neutral-400 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    <p className="font-mono font-bold text-xs">{k.name}</p>
                    <p className="text-[10px] font-mono text-neutral-500">{k.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Brass Weight Plate */}
          <div>
            <label className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 flex items-center justify-between mb-2">
              <span>[ 03 // INTERNAL RESONANCE WEIGHT ]</span>
              <span className="text-[#FF4400] font-bold">
                {config.weightFinish.toUpperCase()}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "gold", name: "PVD Gold", price: "+$55" },
                { id: "gunmetal", name: "Satin Gunmetal", price: "+$20" },
                { id: "chromatic", name: "Chromatic", price: "+$65" },
              ].map((w) => {
                const isSelected = config.weightFinish === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => {
                      playTactileClick("click");
                      setConfig((prev) => ({
                        ...prev,
                        weightFinish: w.id as CustomizerConfig["weightFinish"],
                        animTrigger: { type: "weight_tilt", id: Date.now() },
                      }));
                    }}
                    className={`p-2 border text-center transition-all ${
                      isSelected
                        ? "border-[#FF4400] bg-[#FF4400]/10 text-white shadow-[0_0_12px_rgba(255,68,0,0.25)]"
                        : "border-white/[0.12] bg-[#0A0B0E] text-neutral-400 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    <p className="font-mono font-bold text-xs">{w.name}</p>
                    <p className="text-[10px] font-mono text-neutral-500">{w.price}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 4: Switch Calibration & Acoustic Audition */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-mono uppercase tracking-widest text-neutral-400">
                [ 04 // SWITCH PROFILE & ACTUATION ]
              </label>
              <button
                onClick={previewSwitchSound}
                className="text-[11px] font-mono text-[#00E575] hover:text-[#00F0FF] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>[ ♫ AUDITION ]</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "tactile", name: "Holy Panda", sub: "67g Thock" },
                { id: "linear", name: "Oil Kings", sub: "62g Clack" },
                { id: "clicky", name: "Navy Click", sub: "Crisp Bar" },
              ].map((sw) => {
                const isSelected = switchType === sw.id;
                return (
                  <button
                    key={sw.id}
                    onClick={() => {
                      setSwitchType(sw.id as typeof switchType);
                      previewSwitchSound();
                      setConfig((prev) => ({
                        ...prev,
                        animTrigger: { type: "switch_actuation", id: Date.now() },
                      }));
                    }}
                    className={`p-2 border text-center transition-all ${
                      isSelected
                        ? "border-[#FF4400] bg-[#FF4400]/10 text-white shadow-[0_0_12px_rgba(255,68,0,0.25)]"
                        : "border-white/[0.12] bg-[#0A0B0E] text-neutral-400 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    <p className="font-mono font-bold text-xs">{sw.name}</p>
                    <p className="text-[10px] font-mono text-[#FF9500]">{sw.sub}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Price and Add to Cart */}
          <div className="pt-4 border-t border-white/[0.12] flex flex-col gap-3">
            <div className="flex items-baseline justify-between font-mono">
              <span className="text-xs text-neutral-400 uppercase tracking-widest">
                TOTAL BESPOKE VALUATION:
              </span>
              <span className="text-2xl font-bold text-[#FF4400]">
                {formatPrice(totalPrice)}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddToCart}
                className="flex-1 py-6 font-mono text-xs uppercase tracking-widest bg-[#FF4400] hover:bg-[#FF5511] text-black font-bold flex items-center justify-center gap-2 border border-[#FF4400] transition-all hover:shadow-[0_0_25px_rgba(255,68,0,0.5)] active:scale-[0.99] rounded-none"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-black" />
                    <span>REQUISITION REGISTERED</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-black" />
                    <span>AUTHORIZE PROCUREMENT →</span>
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleSaveToArchive}
                className={`py-6 px-6 font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 border transition-all active:scale-[0.99] rounded-none ${
                  isSaved 
                    ? "bg-[#00E575]/10 border-[#00E575] text-[#00E575] shadow-[0_0_15px_rgba(0,229,117,0.2)]" 
                    : "bg-[#14161F] hover:bg-[#1C202B] border-white/[0.12] hover:border-white/30 text-white"
                }`}
                title="Save configuration to your archive"
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                <span className="hidden sm:inline">{isSaved ? "SAVED" : "ARCHIVE"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
