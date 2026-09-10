import { getProducts } from "@/lib/shopify";
import { HeroSection } from "@/components/blocks/HeroSection";
import { ProductGrid } from "@/components/blocks/ProductGrid";
import { AcousticProfiler } from "@/components/blocks/AcousticProfiler";
import { FeatureBanner } from "@/components/blocks/FeatureBanner";
import { EngineeringMatrix } from "@/components/blocks/EngineeringMatrix";
import Link from "next/link";
import { NewsletterForm } from "@/components/ui/NewsletterForm";

export const revalidate = 3600; // ISR hourly revalidation for Shopify catalog

export default async function HomePage() {
  // Server-side fetch from Shopify Storefront API
  const products = await getProducts(10);

  return (
    <div className="flex flex-col w-full bg-[#090A0D]">
      {/* Scroll-Linked Hero Section - Stutter Free */}
      <HeroSection />

      {/* Hardware Component Grid Section */}
      <ProductGrid products={products} />

      {/* 3D Atelier Configurator Feature Banner - Zero Heavy Blurs */}
      <FeatureBanner />

      {/* Interactive Web Audio Acoustic Profiler */}
      <AcousticProfiler />

      {/* Acoustic Engineering & Craftsmanship Showcase */}
      <EngineeringMatrix />

      {/* Cyber-Industrial Telemetry Footer */}
      <footer className="border-t border-white/[0.08] bg-[#07080A] pt-16 pb-10 px-4 sm:px-6 font-mono">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/[0.08]">
            {/* Column 1: Brand & Status */}
            <div className="lg:col-span-2 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#14161F] border border-white/[0.1] flex items-center justify-center font-bold text-xs text-[#FF4400] overflow-hidden">
                  <img src="/logo-v2.jpg" alt="AuraKeys Logo" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="font-mono font-bold text-sm text-white tracking-wider block">
                    AURAKEYS // LAB-01
                  </span>
                  <span className="text-[9px] uppercase text-[#FF4400] block tracking-widest">
                    CYBER-INDUSTRIAL HARDWARE
                  </span>
                </div>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed font-sans max-w-sm">
                Precision-milled mechanical keyboards, hand-assembled with acoustic resonance chambers, mirror PVD brass weights, and bespoke switches.
              </p>
              <div className="flex items-center gap-2 text-[10px] text-neutral-400 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E575] animate-pulse" />
                <span>QMK / VIA COMPLIANT • HARDWARE DISPATCH ACTIVE</span>
              </div>
            </div>

            {/* Column 2: Atelier Editions */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-[#FF4400] mb-3 font-bold">
                ATELIER EDITIONS
              </h4>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li><a href="#collection" className="hover:text-white transition-colors">65% Compact // Titan-65</a></li>
                <li><a href="#collection" className="hover:text-white transition-colors">75% Rotary // Solaris-75</a></li>
                <li><a href="#collection" className="hover:text-white transition-colors">Tenkeyless // Aegis TKL</a></li>
                <li><a href="#collection" className="hover:text-white transition-colors">Macro Pad // Nocturne</a></li>
              </ul>
            </div>

            {/* Column 3: CAD Lab Systems */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-[#FF4400] mb-3 font-bold">
                CAD LAB SYSTEMS
              </h4>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li><Link href="/studio/customizer" className="hover:text-white transition-colors">3D Workshop Atelier</Link></li>
                <li><a href="#acoustics" className="hover:text-white transition-colors">DSP Acoustic Synth</a></li>
                <li><a href="#engineering" className="hover:text-white transition-colors">Finite Resonance Spec</a></li>
                <li><a href="#collection" className="hover:text-white transition-colors">Curated Catalogue</a></li>
              </ul>
            </div>

            {/* Column 4: Telemetry Dispatch */}
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-[#FF4400] mb-3 font-bold">
                TELEMETRY DISPATCH
              </h4>
              <p className="text-xs text-neutral-400 leading-relaxed mb-2.5 font-sans">
                Subscribe for serialized drop coordinates and prototype releases.
              </p>
              <NewsletterForm />
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-neutral-500">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded overflow-hidden">
                <img src="/logo-v2.jpg" alt="AuraKeys Logo" className="w-full h-full object-cover" />
              </div>
              <span>AURAKEYS LAB © 2026. ALL TELEMETRY LOGGED.</span>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-5">
              <a href="https://shopify.dev/docs/api/storefront" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">SHOPIFY HEADLESS API</a>
              <a href="#collection" className="hover:text-white transition-colors">TERMS OF SALE</a>
              <a href="#collection" className="hover:text-white transition-colors">PRIVACY POLICY</a>
              <a href="#engineering" className="hover:text-white transition-colors">SCHEMATICS</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
