"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { acousticEngine } from "@/lib/acoustics/engine";
import { ShoppingBag, Sparkles, Volume2, VolumeX, Cpu, Menu, X, ArrowRight, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/#collection", label: "01 // ARCHIVE" },
  { href: "/studio/customizer", label: "02 // 3D LAB", isSpecial: true },
  { href: "/#acoustics", label: "03 // SYNTH" },
  { href: "/atelier", label: "04 // ATELIER" },
  { href: "/#engineering", label: "05 // SCHEMATICS" },
];

export function Navbar() {
  const openCart = useCartStore((s) => s.openCart);
  const totalCount = useCartStore((s) => s.getTotalCount());
  const { user, openLoginModal } = useAuthStore();

  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggleSound = () => {
    const next = acousticEngine.toggleSound();
    setSoundOn(next);
    if (next) {
      acousticEngine.playTactileClick("toggle");
    }
  };

  const handleNavClick = () => {
    acousticEngine.playTactileClick("click");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#08090C] border-b border-white/[0.12] shadow-[0_4px_24px_rgba(0,0,0,0.7)] flex items-center">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          {/* Brand Technical Monogram */}
          <Link
            href="/"
            onClick={handleNavClick}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#14161F] border border-white/[0.12] flex items-center justify-center font-mono font-bold text-xs text-[#FF4400] group-hover:border-[#FF4400] group-hover:bg-[#FF4400]/10 transition-colors overflow-hidden">
              <img src="/logo-v2.jpg" alt="AuraKeys Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-bold text-xs tracking-wider text-white flex items-center gap-1.5 leading-none">
                AURAKEYS
                <span className="text-[9px] uppercase font-mono tracking-widest px-1 py-0.5 rounded bg-[#FF4400]/15 text-[#FF4400] border border-[#FF4400]/30">
                  LAB-01
                </span>
              </span>
              <span className="text-[9px] font-mono text-neutral-500 tracking-wider flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E575] animate-pulse" />
                SYS.ONLINE 60Hz
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links - Teenage Engineering Monospace Style */}
          <nav
            onMouseLeave={() => setHoveredIdx(null)}
            className="hidden md:flex items-center gap-1 relative p-1 rounded-lg bg-[#12141A] border border-white/[0.06]"
          >
            {NAV_LINKS.map((link, idx) => {
              const isHovered = hoveredIdx === idx;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleNavClick}
                  onMouseEnter={() => {
                    setHoveredIdx(idx);
                    acousticEngine.playTactileClick("click");
                  }}
                  className={`relative px-3.5 py-1 rounded-md text-[11px] font-mono transition-colors duration-150 z-10 flex items-center gap-1.5 ${
                    link.isSpecial
                      ? "text-[#FF4400] font-semibold"
                      : isHovered
                      ? "text-white"
                      : "text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  {isHovered && (
                    <motion.div
                      layoutId="cyberNavGlider"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute inset-0 rounded-md bg-white/[0.08] border border-white/[0.1]"
                    />
                  )}
                  {link.isSpecial && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF4400]" />
                  )}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Tools: Audio FX Toggle & Requisition Bag */}
          <div className="flex items-center gap-2">
            {/* Auth / Dashboard Button */}
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => acousticEngine.playTactileClick("relay")}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.12] bg-[#14161F] hover:bg-[#1A1E29] hover:border-[#00E575]/50 text-white text-[10px] font-mono tracking-widest transition-colors group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#00E575] shadow-[0_0_8px_#00E575]" />
                <span className="group-hover:text-[#00E575] transition-colors">{user.id}</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  acousticEngine.playTactileClick("click");
                  openLoginModal();
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#FF4400]/30 bg-[#FF4400]/10 hover:bg-[#FF4400]/20 text-[#FF4400] text-[10px] font-mono tracking-widest transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                <span>OPERATOR LOGIN</span>
              </button>
            )}

            {/* Tactile Audio FX Toggle */}
            <button
              onClick={handleToggleSound}
              className={`px-2.5 py-1.5 rounded-lg border font-mono text-[10px] flex items-center gap-1.5 transition-colors ${
                soundOn
                  ? "bg-[#141720] border-white/[0.12] text-neutral-300 hover:border-[#FF4400] hover:text-[#FF4400]"
                  : "bg-[#101217] border-white/[0.06] text-neutral-600"
              }`}
              title="Toggle Mechanical Audio FX"
            >
              {soundOn ? (
                <Volume2 className="w-3.5 h-3.5 text-[#FF4400]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {soundOn ? "FX: ON" : "FX: MUTED"}
              </span>
            </button>

            {/* Flight-Case Style Bag Button */}
            <button
              onClick={() => {
                acousticEngine.playTactileClick("relay");
                openCart();
              }}
              className="relative flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#14161F] hover:bg-[#1A1E29] border border-white/[0.12] hover:border-[#FF4400]/50 text-white text-xs font-mono transition-colors group"
              aria-label="View requisition bag"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#FF4400] transition-colors" />
              <span className="text-[11px] hidden sm:inline text-neutral-300">REQ.BAG</span>
              {totalCount > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-[#FF4400] text-black text-[10px] font-mono font-bold">
                  {totalCount}
                </span>
              )}
            </button>

            {/* Mobile Nav Toggle */}
            <button
              onClick={() => {
                acousticEngine.playTactileClick("click");
                setIsMobileOpen((prev) => !prev);
              }}
              className="md:hidden p-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-neutral-300 hover:text-white"
              aria-label="Toggle mobile menu"
            >
              {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Down Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-x-4 top-20 z-30 md:hidden rounded-xl bg-[#0A0B0E] border border-white/[0.12] p-4 shadow-2xl flex flex-col gap-2 font-mono text-xs"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => {
                  acousticEngine.playTactileClick("click");
                  setIsMobileOpen(false);
                }}
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/[0.05] text-neutral-300 hover:text-white transition-colors"
              >
                <span>{link.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-neutral-600" />
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
