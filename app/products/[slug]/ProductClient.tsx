"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/lib/shopify/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { acousticEngine } from "@/lib/acoustics/engine";
import { 
  ArrowLeft, 
  Terminal, 
  Box, 
  Volume2, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Plus
} from "lucide-react";
import { motion } from "framer-motion";

export function ProductClient({ product }: { product: Product }) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product.variants.edges[0]?.node.id || "");
  const [isAdding, setIsAdding] = useState(false);
  
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const selectedVariant = product.variants.edges.find((v) => v.node.id === selectedVariantId)?.node 
    || product.variants.edges[0]?.node;

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    
    acousticEngine.playTactileClick("relay");
    setIsAdding(true);
    
    addItem({
      id: `${product.id}-${selectedVariant.id}`,
      productId: product.id,
      variantId: selectedVariant.id,
      title: product.title,
      variantTitle: selectedVariant.title,
      price: parseFloat(selectedVariant.price.amount),
      currencyCode: selectedVariant.price.currencyCode,
      image: product.featuredImage?.url || "",
    });

    setTimeout(() => {
      setIsAdding(false);
      openCart();
    }, 500);
  };

  const handlePlaySound = () => {
    // Play a sequence of 3 rapid clicks to simulate a typing test
    acousticEngine.playTactileClick("click");
    setTimeout(() => acousticEngine.playTactileClick("click"), 120);
    setTimeout(() => acousticEngine.playTactileClick("relay"), 280);
  };

  const isAvailable = selectedVariant?.availableForSale ?? false;

  return (
    <div className="min-h-screen bg-[#07080A] pt-24 pb-24 selection:bg-[#FF4400] selection:text-black">
      {/* Background Matrix */}
      <div className="fixed inset-0 bg-dot-matrix pointer-events-none opacity-20" />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 relative z-10">
        
        {/* Back Navigation */}
        <Link 
          href="/#collection" 
          onClick={() => acousticEngine.playTactileClick("click")}
          className="inline-flex items-center gap-2 text-neutral-500 hover:text-white font-mono text-xs uppercase tracking-widest mb-10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          RETURN TO ARCHIVE
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* LEFT: Image Gallery (Sticky on Desktop) */}
          <div className="lg:col-span-7">
            <div className="sticky top-32 space-y-6">
              <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/[0.1] bg-black shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                {product.featuredImage && (
                  <Image 
                    src={product.featuredImage.url} 
                    alt={product.title} 
                    fill 
                    priority
                    className="object-cover"
                  />
                )}
                {/* Image HUD */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {product.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/[0.1] font-mono text-[10px] text-[#FF4400] tracking-widest uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="absolute bottom-4 right-4 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-white/[0.1] font-mono text-[10px] text-white tracking-widest">
                  SCALE 1:1
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/[0.1] bg-[#0E1016]">
                  {/* Mock gallery image 1 */}
                  <Image src={product.featuredImage?.url || ""} alt="Detail 1" fill className="object-cover opacity-60 mix-blend-luminosity hover:mix-blend-normal transition-all duration-500" />
                </div>
                <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/[0.1] bg-[#0E1016] flex items-center justify-center p-8 group">
                  <div className="absolute inset-0 bg-dot-matrix opacity-30" />
                  <div className="relative z-10 text-center">
                    <Box className="w-8 h-8 text-[#FF4400] mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <div className="font-mono text-xs text-white uppercase tracking-widest font-bold">3D CAD MODEL</div>
                    <Link 
                      href={`/studio/customizer?model=${product.handle.replace('aura-', '')}`}
                      className="inline-block mt-3 px-4 py-1.5 border border-[#FF4400]/40 text-[#FF4400] font-mono text-[10px] rounded hover:bg-[#FF4400]/10 transition-colors"
                      onClick={() => acousticEngine.playTactileClick("relay")}
                    >
                      INITIATE VIEW
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Telemetry & Checkout Panel */}
          <div className="lg:col-span-5 flex flex-col pt-4">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-white/10 w-fit mb-6">
              <Terminal className="w-3.5 h-3.5 text-[#00E575]" />
              <span className="font-mono text-[10px] text-[#00E575] uppercase tracking-widest font-bold">
                HARDWARE SPECIFICATION
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-display font-black text-white uppercase tracking-tight mb-4">
              {product.title}
            </h1>
            
            <p className="text-neutral-400 font-sans text-sm sm:text-base leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="flex items-center justify-between border-y border-white/[0.08] py-6 mb-8">
              <div>
                <div className="text-[10px] font-mono text-neutral-500 tracking-widest uppercase mb-1">REQUISITION VALUE</div>
                <div className="text-3xl font-mono font-bold text-white tracking-tight">
                  {selectedVariant ? formatPrice(parseFloat(selectedVariant.price.amount), selectedVariant.price.currencyCode) : "---"}
                </div>
              </div>
              
              <button 
                onClick={handlePlaySound}
                className="flex items-center gap-2 px-4 py-3 rounded-lg bg-[#11131A] border border-white/[0.1] hover:bg-[#1A1D24] hover:border-white/[0.2] transition-colors group"
              >
                <div className="w-8 h-8 rounded-full bg-[#00E575]/10 flex items-center justify-center group-active:scale-95 transition-transform">
                  <Volume2 className="w-4 h-4 text-[#00E575]" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="font-mono text-[10px] text-neutral-400">ACOUSTIC PROFILE</div>
                  <div className="font-mono text-xs font-bold text-white">TEST SWITCH</div>
                </div>
              </button>
            </div>

            {/* Variant Selector */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-mono text-xs text-white uppercase tracking-widest font-bold">SELECT CONFIGURATION</h3>
                <span className="font-mono text-[10px] text-neutral-500">{product.variants.edges.length} VARIANTS</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {product.variants.edges.map(({ node }) => {
                  const isSelected = selectedVariantId === node.id;
                  return (
                    <button
                      key={node.id}
                      onClick={() => {
                        acousticEngine.playTactileClick("click");
                        setSelectedVariantId(node.id);
                      }}
                      className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                        isSelected 
                          ? "bg-[#FF4400]/5 border-[#FF4400] shadow-[0_0_20px_rgba(255,68,0,0.1)]" 
                          : "bg-[#0E1016] border-white/[0.08] hover:border-white/20"
                      }`}
                    >
                      <div>
                        <div className={`font-mono text-xs font-bold uppercase tracking-wider mb-1 ${isSelected ? "text-white" : "text-neutral-300"}`}>
                          {node.title.split(' / ')[0]}
                        </div>
                        <div className="font-mono text-[10px] text-neutral-500">
                          SWITCH: {node.title.split(' / ')[1] || "STANDARD"}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`font-mono text-sm font-bold ${isSelected ? "text-[#FF4400]" : "text-white"}`}>
                          {formatPrice(parseFloat(node.price.amount), node.price.currencyCode)}
                        </div>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? "border-[#FF4400] bg-[#FF4400]" : "border-white/[0.2] bg-transparent"}`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              disabled={!isAvailable || isAdding}
              onClick={handleAddToCart}
              className={`w-full py-5 rounded-xl font-mono font-bold text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                isAvailable
                  ? "bg-[#FF4400] hover:bg-[#FF5511] text-black shadow-[0_0_30px_rgba(255,68,0,0.3)] active:translate-y-0.5"
                  : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
              }`}
            >
              {isAdding ? (
                "ALLOCATING..."
              ) : isAvailable ? (
                <>
                  <Plus className="w-5 h-5" />
                  ADD TO REQUISITION
                </>
              ) : (
                "OUT OF STOCK"
              )}
            </button>

            {/* Micro Specs */}
            <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/[0.08]">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-neutral-500" />
                <div>
                  <div className="font-mono text-[10px] text-neutral-500 tracking-widest">WARRANTY</div>
                  <div className="font-mono text-xs font-bold text-white mt-0.5">LIFETIME</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Cpu className="w-5 h-5 text-neutral-500" />
                <div>
                  <div className="font-mono text-[10px] text-neutral-500 tracking-widest">FIRMWARE</div>
                  <div className="font-mono text-xs font-bold text-white mt-0.5">QMK / VIA</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Layers className="w-5 h-5 text-neutral-500" />
                <div>
                  <div className="font-mono text-[10px] text-neutral-500 tracking-widest">MOUNTING</div>
                  <div className="font-mono text-xs font-bold text-white mt-0.5">ISOLATED GASKET</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Box className="w-5 h-5 text-neutral-500" />
                <div>
                  <div className="font-mono text-[10px] text-neutral-500 tracking-widest">DISPATCH</div>
                  <div className="font-mono text-xs font-bold text-white mt-0.5">GLOBAL EXPRESS</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
