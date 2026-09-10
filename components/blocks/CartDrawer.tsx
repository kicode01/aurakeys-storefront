"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/useCartStore";
import { createCheckoutSession } from "@/app/actions/checkout";
import { formatPrice } from "@/lib/utils";
import { acousticEngine } from "@/lib/acoustics/engine";
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Loader2, Sparkles, Package } from "lucide-react";

const FREE_SHIPPING_THRESHOLD = 500;

export function CartDrawer() {
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const {
    isOpen,
    closeCart,
    items,
    updateQuantity,
    removeItem,
    getTotalPrice,
    getTotalCount,
  } = useCartStore();

  const totalPrice = getTotalPrice();
  const totalCount = getTotalCount();
  const progressToFreeShipping = Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100);
  const amountNeeded = Math.max(0, FREE_SHIPPING_THRESHOLD - totalPrice);

  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      setCheckoutError(null);
      
      const lines = items.map((item) => ({
        merchandiseId: item.variantId,
        quantity: item.quantity,
      }));

      const res = await createCheckoutSession(lines);

      if (res.error) {
        setCheckoutError(res.error);
        setIsCheckingOut(false);
        return;
      }

      if (res.checkoutUrl) {
        // Redirect to the real Shopify Checkout
        window.location.href = res.checkoutUrl;
      }
      
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : "Checkout error");
      setIsCheckingOut(false);
    }
  };

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop with Smooth Fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Shopco-Style Spring-Loaded Slide-Out Panel */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-8 sm:pl-12">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                damping: 32,
                stiffness: 300,
              }}
              className="w-screen max-w-md bg-[#0C0E14] border-l border-white/[0.08] shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col h-full"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-white/[0.08] bg-[#0E1018] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h2 className="font-mono font-bold text-sm text-white tracking-wider uppercase">
                    REQ.LOCKER // ACTIVE
                  </h2>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FF4400] text-black">
                    {totalCount} {totalCount === 1 ? "UNIT" : "UNITS"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    acousticEngine.playTactileClick("click");
                    closeCart();
                  }}
                  className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Insured Free Shipping Progress Bar */}
              <div className="px-5 py-3 bg-[#12141C] border-b border-white/[0.08]">
                <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                  <span className="text-neutral-400 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-[#FF4400]" />
                    {amountNeeded > 0 ? (
                      <span>Add <strong className="text-white">${amountNeeded.toFixed(0)}</strong> for Insured Courier</span>
                    ) : (
                      <span className="text-[#00E575] font-bold">● EXPRESS COURIER UNLOCKED</span>
                    )}
                  </span>
                  <span className="text-[#FF4400] font-bold">{progressToFreeShipping.toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-sm bg-black overflow-hidden border border-white/[0.08]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToFreeShipping}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="h-full bg-[#FF4400]"
                  />
                </div>
              </div>

              {/* Cart Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 divide-y divide-white/[0.06] scrollbar-thin">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-16 font-mono">
                    <div className="w-14 h-14 rounded-lg bg-[#14161F] border border-white/[0.08] flex items-center justify-center text-neutral-500 mb-3">
                      <Sparkles className="w-6 h-6 text-[#FF4400]" />
                    </div>
                    <p className="font-bold text-sm text-white uppercase tracking-wider">
                      YOUR BAG IS EMPTY
                    </p>
                    <p className="text-[11px] text-neutral-400 max-w-xs mt-1 leading-relaxed">
                      Select a bespoke chassis edition from our curated catalogue or forge custom components in the 3D studio.
                    </p>
                    <button
                      onClick={() => {
                        acousticEngine.playTactileClick("click");
                        closeCart();
                      }}
                      className="mt-5 px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-[#FF4400] hover:text-black border border-white/[0.12] hover:border-[#FF4400] text-white text-xs font-mono font-bold transition-all uppercase tracking-wider"
                    >
                      EXPLORE CURATED EDITIONS
                    </button>
                  </div>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.variantId}
                      className="pt-3 first:pt-0 flex gap-3.5 items-start"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-16 h-16 rounded-md overflow-hidden border border-white/[0.08] bg-black flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col justify-between min-h-[4.5rem]">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-mono font-bold text-xs text-white line-clamp-1">
                              {item.title}
                            </h4>
                            <button
                              onClick={() => {
                                acousticEngine.playTactileClick("click");
                                removeItem(item.variantId);
                              }}
                              className="text-neutral-500 hover:text-[#FF4400] transition-colors p-0.5"
                              aria-label={`Remove ${item.title}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[10px] font-mono text-[#FF4400] mt-0.5">
                            {item.variantTitle}
                          </p>
                        </div>

                        {/* Price & Quantity Controls */}
                        <div className="flex items-center justify-between pt-1 font-mono">
                          <span className="text-xs font-bold text-white">
                            {formatPrice(item.price * item.quantity, item.currencyCode)}
                          </span>

                          <div className="flex items-center border border-white/[0.1] rounded-md bg-[#12141A]">
                            <button
                              onClick={() => {
                                acousticEngine.playTactileClick("click");
                                updateQuantity(item.variantId, item.quantity - 1);
                              }}
                              className="p-1 text-neutral-400 hover:text-white transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-[11px] px-2 text-white font-bold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => {
                                acousticEngine.playTactileClick("click");
                                updateQuantity(item.variantId, item.quantity + 1);
                              }}
                              className="p-1 text-neutral-400 hover:text-white transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Drawer Footer & Checkout Action */}
              {items.length > 0 && (
                <div className="p-5 border-t border-white/[0.08] bg-[#0A0B0E] flex flex-col gap-3 font-mono">
                  {/* Status telemetry */}
                  <div className="flex items-center gap-2 text-[10px] text-[#00E575] bg-[#00E575]/10 border border-[#00E575]/20 px-3 py-2 rounded-md">
                    <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>INSURED AIR CARGO // SECURE PACKAGING</span>
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>SUBTOTAL</span>
                      <span className="text-white">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>CNC CALIBRATION & QC</span>
                      <span className="text-[#00E575]">COMPLIMENTARY</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/[0.08]">
                      <span>TOTAL REQ</span>
                      <span className="text-[#FF4400] text-base">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>

                  {/* Error banner if checkout failed */}
                  {checkoutError && (
                    <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                      {checkoutError}
                    </div>
                  )}

                  {/* Checkout CTA */}
                  <button
                    disabled={isCheckingOut}
                    onClick={() => {
                      acousticEngine.playTactileClick("relay");
                      handleCheckout();
                    }}
                    className="w-full py-3 px-5 rounded-lg bg-[#FF4400] hover:bg-[#FF5511] text-black font-mono font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,68,0,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:translate-y-0.5"
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>DISPATCHING SESSION...</span>
                      </>
                    ) : (
                      <>
                        <span>AUTHORIZE PROCUREMENT</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
