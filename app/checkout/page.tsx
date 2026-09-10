"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { acousticEngine } from "@/lib/acoustics/engine";
import { formatPrice } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  Terminal, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  Wallet
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Simulated Loading Steps
const BOOT_SEQUENCE = [
  "ESTABLISHING SECURE TELEMETRY...",
  "VERIFYING HARDWARE MANIFEST...",
  "ALLOCATING CNC MACHINE TIME...",
  "SECURE TERMINAL READY."
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  
  const [bootStep, setBootStep] = useState(0);
  const [isBooting, setIsBooting] = useState(true);
  const [checkoutStage, setCheckoutStage] = useState<"manifest" | "payment" | "processing" | "success">("manifest");
  
  // Fake card state
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // Boot sequence effect
  useEffect(() => {
    if (!isBooting) return;
    
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < BOOT_SEQUENCE.length) {
        setBootStep(currentStep);
        acousticEngine.playTactileClick("click");
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setIsBooting(false);
          acousticEngine.playTactileClick("relay");
        }, 800);
      }
    }, 600);
    
    return () => clearInterval(interval);
  }, [isBooting]);

  // Redirect if empty
  useEffect(() => {
    if (!isBooting && items.length === 0 && checkoutStage !== "success") {
      router.push("/");
    }
  }, [items, isBooting, checkoutStage, router]);

  const handleProcessPayment = () => {
    acousticEngine.playTactileClick("relay");
    setCheckoutStage("processing");
    
    // Simulate API processing
    setTimeout(() => {
      acousticEngine.playTactileClick("toggle");
      setCheckoutStage("success");
      clearCart();
    }, 3500);
  };

  const totalPrice = getTotalPrice();
  const shipping = totalPrice > 0 ? 35 : 0; // Flat $35 global priority shipping
  const finalTotal = totalPrice + shipping;

  if (isBooting) {
    return (
      <div className="min-h-screen bg-[#07080A] bg-dot-matrix flex flex-col items-center justify-center p-6 selection:bg-[#FF4400] selection:text-black">
        <div className="max-w-md w-full space-y-4">
          <div className="flex items-center gap-3 text-[#FF4400] mb-8">
            <Terminal className="w-5 h-5 animate-pulse" />
            <span className="font-mono text-sm tracking-widest font-bold">SECURE REQUISITION PROTOCOL</span>
          </div>
          
          <div className="space-y-2 font-mono text-xs">
            {BOOT_SEQUENCE.slice(0, bootStep + 1).map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 ${idx === bootStep ? "text-white" : "text-neutral-600"}`}
              >
                <span className="text-[#00E575]">{">"}</span>
                {msg}
              </motion.div>
            ))}
            
            {bootStep < BOOT_SEQUENCE.length - 1 && (
              <motion.div 
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="w-2.5 h-4 bg-[#FF4400] mt-4"
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080A] bg-dot-matrix pt-24 pb-16 selection:bg-[#FF4400] selection:text-black font-sans overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Terminal Header */}
        <div className="flex items-end justify-between border-b border-white/[0.12] pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[#FF4400] text-[10px] font-mono tracking-widest uppercase mb-2 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              256-BIT ENCRYPTED TUNNEL
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-white uppercase tracking-tight">
              HARDWARE PROCUREMENT
            </h1>
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-[10px] font-mono text-neutral-500 mb-1">SESSION ID</div>
            <div className="text-xs font-mono text-white">REQ-{Math.random().toString(36).substring(2, 10).toUpperCase()}</div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          
          {/* STAGE 1: MANIFEST & PAYMENT */}
          {(checkoutStage === "manifest" || checkoutStage === "payment") && (
            <motion.div 
              key="stage-1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              
              {/* Left Column: Payment Input */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Mock PayPal Sandbox Option */}
                <div className="p-6 rounded-2xl bg-[#0E1016] border border-white/[0.08] shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-white font-mono font-bold text-sm uppercase tracking-widest">EXPRESS DISPATCH</h3>
                      <p className="text-neutral-500 text-[11px] font-mono mt-1">Authorized 3rd-Party Gateway</p>
                    </div>
                    <Wallet className="w-5 h-5 text-[#00E575]" />
                  </div>
                  <button 
                    onClick={() => {
                      acousticEngine.playTactileClick("relay");
                      setCheckoutStage("processing");
                      setTimeout(() => {
                        acousticEngine.playTactileClick("toggle");
                        setCheckoutStage("success");
                        clearCart();
                      }, 4000);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-[#003087] hover:bg-[#002266] text-white py-3.5 rounded-xl transition-all border border-[#0079C1] font-bold tracking-wide"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.474 0-.88.356-.952.826l-1.218 7.18z"/>
                    </svg>
                    Simulate PayPal Sandbox
                  </button>
                </div>

                {/* Mock Credit Card Terminal */}
                <div className="p-6 rounded-2xl bg-[#0E1016] border border-white/[0.08] shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <ShieldCheck className="w-32 h-32" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div>
                      <h3 className="text-white font-mono font-bold text-sm uppercase tracking-widest">SECURE CARD TERMINAL</h3>
                      <p className="text-neutral-500 text-[11px] font-mono mt-1">Direct Vault Authentication</p>
                    </div>
                    <CreditCard className="w-5 h-5 text-[#FF4400]" />
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div>
                      <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-1.5">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000" 
                        className="w-full bg-[#1A1D24] border border-white/[0.1] rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#FF4400] transition-colors"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        onKeyDown={() => acousticEngine.playTactileClick("click")}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-1.5">Expiry (MM/YY)</label>
                        <input 
                          type="text" 
                          placeholder="12/26" 
                          className="w-full bg-[#1A1D24] border border-white/[0.1] rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#FF4400] transition-colors"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          onKeyDown={() => acousticEngine.playTactileClick("click")}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block mb-1.5">Security Code</label>
                        <input 
                          type="password" 
                          placeholder="***" 
                          maxLength={4}
                          className="w-full bg-[#1A1D24] border border-white/[0.1] rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-[#FF4400] transition-colors"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          onKeyDown={() => acousticEngine.playTactileClick("click")}
                        />
                      </div>
                    </div>
                    
                    <button 
                      onClick={handleProcessPayment}
                      className="w-full mt-4 py-4 rounded-xl bg-[#FF4400] hover:bg-[#FF5511] text-black font-mono font-bold text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(255,68,0,0.3)] transition-all flex items-center justify-center gap-2 active:translate-y-0.5"
                    >
                      <Lock className="w-4 h-4" />
                      AUTHORIZE {formatPrice(finalTotal, "USD")}
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Hardware Manifest */}
              <div className="lg:col-span-5">
                <div className="p-6 rounded-2xl bg-[#111319] border border-white/[0.08]">
                  <h3 className="text-white font-mono font-bold text-sm uppercase tracking-widest mb-6 border-b border-white/[0.08] pb-4">
                    HARDWARE MANIFEST
                  </h3>
                  
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div key={item.variantId} className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg bg-black border border-white/[0.1] relative overflow-hidden flex-shrink-0">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-white truncate">{item.title}</div>
                          <div className="text-[10px] font-mono text-neutral-500 mt-1 truncate">{item.variantTitle}</div>
                          <div className="text-xs font-mono text-[#FF4400] mt-1.5">{formatPrice(item.price, item.currencyCode)}</div>
                        </div>
                        <div className="text-xs font-mono text-neutral-500 font-bold">
                          x{item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-white/[0.08] pt-4 space-y-3 font-mono text-xs">
                    <div className="flex justify-between text-neutral-400">
                      <span>SUBTOTAL</span>
                      <span className="text-white">{formatPrice(totalPrice, "USD")}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>GLOBAL PRIORITY DISPATCH</span>
                      <span className="text-white">{formatPrice(shipping, "USD")}</span>
                    </div>
                    <div className="border-t border-white/[0.08] pt-3 flex justify-between font-bold text-sm">
                      <span className="text-white">TOTAL REQUISITION</span>
                      <span className="text-[#FF4400]">{formatPrice(finalTotal, "USD")}</span>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* STAGE 2: PROCESSING */}
          {checkoutStage === "processing" && (
            <motion.div 
              key="stage-2"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="relative w-24 h-24 mb-8">
                <div className="absolute inset-0 rounded-full border-4 border-[#1A1D24]" />
                <div className="absolute inset-0 rounded-full border-4 border-[#FF4400] border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-[#FF4400] animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-display font-black text-white uppercase tracking-widest mb-2">
                AUTHORIZING TRANSACTION
              </h2>
              <p className="text-xs font-mono text-neutral-500">Contacting secure financial gateways...</p>
            </motion.div>
          )}

          {/* STAGE 3: SUCCESS */}
          {checkoutStage === "success" && (
            <motion.div 
              key="stage-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 sm:p-12 rounded-3xl bg-[#0E1016] border border-[#00E575]/30 shadow-[0_0_50px_rgba(0,229,117,0.15)] relative overflow-hidden"
            >
              {/* Decorative Blueprint Background */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03]">
                <div className="w-full h-full bg-[linear-gradient(to_right,#00E575_1px,transparent_1px),linear-gradient(to_bottom,#00E575_1px,transparent_1px)] bg-[size:2rem_2rem]" />
              </div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl bg-[#00E575]/10 border border-[#00E575]/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,229,117,0.3)]">
                  <CheckCircle2 className="w-10 h-10 text-[#00E575]" />
                </div>
                
                <h2 className="text-3xl sm:text-5xl font-display font-black text-white uppercase tracking-tight mb-4">
                  PROCUREMENT <span className="text-[#00E575]">AUTHORIZED</span>
                </h2>
                
                <p className="text-sm text-neutral-400 font-sans max-w-lg mx-auto mb-8 leading-relaxed">
                  Your bespoke hardware components have been allocated. 
                  CNC machining and PVD finishing will commence shortly in the atelier.
                </p>

                <div className="w-full max-w-md bg-[#111319] border border-white/[0.08] p-5 rounded-xl text-left font-mono text-xs mb-8">
                  <div className="flex justify-between border-b border-white/[0.08] pb-3 mb-3">
                    <span className="text-neutral-500">DISPATCH ID</span>
                    <span className="text-white font-bold">DS-{(Math.random() * 100000).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.08] pb-3 mb-3">
                    <span className="text-neutral-500">ESTIMATED COMPLETION</span>
                    <span className="text-[#00E575] font-bold">14 DAYS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">STATUS</span>
                    <span className="text-white">IN QUEUE</span>
                  </div>
                </div>

                <Link href="/#collection" onClick={() => acousticEngine.playTactileClick("click")}>
                  <button className="px-8 py-4 rounded-xl bg-white hover:bg-neutral-200 text-black font-mono font-bold text-xs uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-2">
                    RETURN TO CATALOGUE
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
