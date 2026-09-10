"use client";

import { useState } from "react";
import { Product } from "@/lib/shopify/types";
import { ProductCard } from "./ProductCard";
import { acousticEngine } from "@/lib/acoustics/engine";
import { SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductGridProps {
  products: Product[];
}

const CATEGORIES = [
  { id: "All", label: "All Formats", tag: "All" },
  { id: "65%", label: "65% Compact", tag: "65%" },
  { id: "75%", label: "75% Rotary", tag: "75%" },
  { id: "TKL", label: "Tenkeyless", tag: "TKL" },
  { id: "Macro Pad", label: "Macro Pad", tag: "Macro Pad" },
];

export function ProductGrid({ products }: ProductGridProps) {
  const [selectedTag, setSelectedTag] = useState<string>("All");

  const getCategoryCount = (tag: string) => {
    if (tag === "All") return products.length;
    return products.filter((p) => p.tags.includes(tag)).length;
  };

  const filteredProducts =
    selectedTag === "All"
      ? products
      : products.filter((p) => p.tags.includes(selectedTag));

  const handleFilterClick = (tag: string) => {
    acousticEngine.playTactileClick("click");
    setSelectedTag(tag);
  };

  return (
    <section id="collection" className="py-24 px-4 sm:px-8 max-w-7xl mx-auto w-full">
      {/* Editorial Section Header */}
      <div className="mb-10 border-b border-white/[0.08] pb-8">
        {/* Eyebrow & Status Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2.5 text-[#FF4400] text-[11px] font-mono tracking-widest uppercase font-bold">
            <span className="w-2 h-2 rounded-full bg-[#FF4400] shadow-[0_0_10px_#FF4400]" />
            <span>THE ATELIER COLLECTION</span>
            <span className="text-neutral-600">/</span>
            <span className="text-neutral-400 font-normal">2026 BESPOKE ARCHIVES</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[11px] font-mono text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E575] animate-pulse" />
            <span>{filteredProducts.length} {filteredProducts.length === 1 ? "EDITION" : "EDITIONS"} AVAILABLE</span>
          </div>
        </div>

        {/* Headline & Specs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6"
        >
          <div className="max-w-2xl">
            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase">
              CURATED EDITIONS
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 mt-2 font-sans leading-relaxed">
              CNC machined from monolithic 6063 aerospace billets, hand-finished with artisan PVD brass, and acoustically calibrated for zero harmonic resonance.
            </p>
          </div>

          {/* Luxury Technical Spec Badges */}
          <div className="hidden lg:flex items-center gap-5 text-xs font-mono text-neutral-500 pb-1">
            <div className="flex flex-col">
              <span className="text-white font-bold">1000Hz VIA</span>
              <span className="text-[10px] text-neutral-400">Zero Latency</span>
            </div>
            <div className="h-7 w-px bg-white/[0.1]" />
            <div className="flex flex-col">
              <span className="text-white font-bold">SOLID BRASS</span>
              <span className="text-[10px] text-neutral-400">Acoustic Weight</span>
            </div>
            <div className="h-7 w-px bg-white/[0.1]" />
            <div className="flex flex-col">
              <span className="text-white font-bold">HOT-SWAP</span>
              <span className="text-[10px] text-neutral-400">5-Pin Kailh</span>
            </div>
          </div>
        </motion.div>

        {/* Dedicated Filter Navigation Bar */}
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#0D0F14] border border-white/[0.08] overflow-x-auto no-scrollbar shadow-inner max-w-full">
            <div className="px-2.5 py-1.5 text-neutral-500 flex items-center gap-1.5 flex-shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="text-[10px] font-mono tracking-wider uppercase hidden sm:inline">Format:</span>
            </div>

            {CATEGORIES.map((cat) => {
              const isActive = selectedTag === cat.tag;
              const count = getCategoryCount(cat.tag);

              return (
                <button
                  key={cat.id}
                  onClick={() => handleFilterClick(cat.tag)}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-mono tracking-wide transition-all whitespace-nowrap z-10 flex items-center gap-2 ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-neutral-400 hover:text-white hover:bg-white/[0.03]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="atelierFilterPill"
                      transition={{ type: "spring", stiffness: 450, damping: 32 }}
                      className="absolute inset-0 rounded-xl bg-gradient-to-b from-white/[0.14] to-white/[0.06] border border-white/[0.18] shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
                    />
                  )}
                  {isActive && (
                    <span className="relative z-10 w-1.5 h-1.5 rounded-full bg-[#FF4400] shadow-[0_0_6px_#FF4400]" />
                  )}
                  <span className="relative z-10">{cat.label}</span>
                  <span
                    className={`relative z-10 text-[10px] px-1.5 py-0.5 rounded-md font-mono transition-colors ${
                      isActive
                        ? "bg-white/[0.15] text-white font-bold"
                        : "bg-white/[0.04] text-neutral-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="text-[11px] font-mono text-neutral-500 hidden md:block">
            Showing {filteredProducts.length} of {products.length} models
          </span>
        </div>
      </div>

      {/* Responsive Hardware Grid - Zero heavy transforms while scrolling */}
      <motion.div 
        layout 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
              }}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
