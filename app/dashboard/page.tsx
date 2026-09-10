"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { acousticEngine } from "@/lib/acoustics/engine";
import { Terminal, ShieldCheck, Box, LogOut, ArrowRight, Trash2, Cpu } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, savedBuilds, orderHistory, logout, deleteBuild } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  if (!mounted || !user) return null;

  const handleLogout = () => {
    acousticEngine.playTactileClick("click");
    logout();
    router.push("/");
  };

  return (
    <div className="pt-28 pb-16 min-h-screen bg-[#07080A] text-white">
      {/* Precision Background */}
      <div className="absolute inset-0 bg-dot-matrix pointer-events-none opacity-30" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/[0.12] pb-6 mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2 py-1 mb-3 rounded bg-[#00E575]/10 border border-[#00E575]/30 text-[#00E575]">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-mono text-[10px] uppercase font-bold tracking-widest">
                AUTHENTICATED SESSION
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-mono font-black uppercase tracking-tighter">
              OPERATOR ARCHIVE
            </h1>
            <p className="font-mono text-xs text-neutral-400 mt-2 tracking-wider">
              ID: {user.id} // SECURE ENCLAVE ACTIVE
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-white/[0.12] rounded bg-[#14161F] hover:bg-[#1A1E29] hover:border-[#FF4400]/50 transition-colors text-xs font-mono text-neutral-400 hover:text-[#FF4400]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>TERMINATE SESSION</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Column: Saved Builds */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="font-mono text-sm tracking-widest text-[#FF4400] flex items-center gap-2">
              <Box className="w-4 h-4" />
              <span>SAVED BESPOKE CONFIGURATIONS</span>
            </h2>

            {savedBuilds.length === 0 ? (
              <div className="border border-dashed border-white/[0.15] rounded-xl p-12 flex flex-col items-center justify-center text-center bg-[#0C0E14]">
                <Cpu className="w-8 h-8 text-neutral-600 mb-4" />
                <h3 className="font-mono text-sm text-neutral-300 mb-2 uppercase tracking-widest">NO DATA FOUND</h3>
                <p className="font-sans text-sm text-neutral-500 mb-6 max-w-md">
                  You have not saved any hardware configurations yet. Visit the 3D Customizer to compile and save your bespoke builds.
                </p>
                <Link href="/studio/customizer">
                  <button className="px-5 py-2.5 bg-[#FF4400]/10 border border-[#FF4400]/30 hover:bg-[#FF4400] hover:text-black text-[#FF4400] font-mono text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2">
                    <span>ENTER 3D LAB</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedBuilds.map((build) => {
                  // Determine image based on model
                  let imgSrc = "/images/products/titan-65.jpg";
                  let modelId = "titan-65";
                  if (build.model.includes("Solaris")) { imgSrc = "/images/products/solaris-75.jpg"; modelId = "solaris-75"; }
                  else if (build.model.includes("Aegis")) { imgSrc = "/images/products/aegis-tkl.jpg"; modelId = "aegis-tkl"; }
                  else if (build.model.includes("Nocturne")) { imgSrc = "/images/products/nocturne-pad.jpg"; modelId = "nocturne-pad"; }

                  return (
                    <motion.div
                      key={build.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="group bg-[#0D0F14] border border-white/[0.08] hover:border-[#FF4400]/40 rounded-xl overflow-hidden transition-colors"
                    >
                      <div className="relative aspect-[16/9] w-full bg-black">
                        <Image src={imgSrc} alt={build.model} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-black/80 backdrop-blur text-white font-mono text-[9px] tracking-widest rounded border border-white/10">
                          {build.id}
                        </div>
                        <button
                          onClick={() => deleteBuild(build.id)}
                          className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-red-500/20 text-neutral-400 hover:text-red-500 rounded backdrop-blur border border-white/10 hover:border-red-500/50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="p-4">
                        <h3 className="font-mono font-bold text-sm text-white uppercase tracking-tight mb-3">
                          {build.model}
                        </h3>
                        <div className="space-y-1.5 mb-5">
                          <div className="flex justify-between font-mono text-[10px]">
                            <span className="text-neutral-500">CHASSIS</span>
                            <span className="text-[#00F0FF] uppercase">{build.caseColor}</span>
                          </div>
                          <div className="flex justify-between font-mono text-[10px]">
                            <span className="text-neutral-500">KEYCAPS</span>
                            <span className="text-white uppercase">{build.keycapColor}</span>
                          </div>
                          <div className="flex justify-between font-mono text-[10px]">
                            <span className="text-neutral-500">SWITCHES</span>
                            <span className="text-[#FF9500] uppercase">{build.switchType}</span>
                          </div>
                        </div>
                        <Link href={`/studio/customizer?model=${modelId}`}>
                          <button className="w-full py-2 bg-white/[0.03] hover:bg-[#FF4400] border border-white/[0.08] group-hover:border-[#FF4400] text-neutral-300 hover:text-black font-mono text-[10px] font-bold uppercase tracking-widest rounded transition-colors flex items-center justify-center gap-1.5">
                            <span>LOAD CONFIGURATION</span>
                            <Terminal className="w-3 h-3" />
                          </button>
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Requisition History */}
          <div className="space-y-6">
            <h2 className="font-mono text-sm tracking-widest text-[#00E575] flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span>REQUISITION LOG</span>
            </h2>

            <div className="bg-[#0C0E14] border border-white/[0.12] rounded-xl p-1 overflow-hidden">
              {orderHistory.length === 0 ? (
                <div className="p-6 text-center text-neutral-500 font-mono text-[10px] tracking-widest">
                  NO PREVIOUS REQUISITIONS
                </div>
              ) : (
                orderHistory.map((order, idx) => (
                  <div 
                    key={order.id} 
                    className={`p-4 ${idx !== orderHistory.length - 1 ? 'border-b border-white/[0.06]' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="block font-mono text-xs font-bold text-white mb-0.5">{order.id}</span>
                        <span className="block font-mono text-[9px] text-neutral-500">{new Date(order.date).toLocaleDateString()}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold tracking-widest border ${
                        order.status === 'DELIVERED' ? 'bg-[#00E575]/10 border-[#00E575]/30 text-[#00E575]' :
                        'bg-[#FF9500]/10 border-[#FF9500]/30 text-[#FF9500]'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-2 mb-3">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between font-mono text-[10px]">
                          <span className="text-neutral-400 truncate pr-4">{item.quantity}x {item.title}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-white/[0.06]">
                      <span className="font-mono text-[10px] text-neutral-500 tracking-widest">TOTAL</span>
                      <span className="font-mono text-xs font-bold text-white">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Support / Contact Widget */}
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-5 mt-6">
              <h3 className="font-mono text-xs font-bold text-white mb-2 uppercase tracking-widest">Support Enclave</h3>
              <p className="font-sans text-xs text-neutral-400 mb-4">
                Require telemetry assistance or CNC modification for an active requisition? 
              </p>
              <a 
                href={`mailto:support@aurakeys.com?subject=Requisition Support [${user.id}]`}
                onClick={() => acousticEngine.playTactileClick("relay")}
                className="w-full py-2 bg-transparent hover:bg-white/[0.05] border border-white/[0.12] text-neutral-300 font-mono text-[10px] uppercase tracking-widest rounded transition-colors block text-center"
              >
                INITIALIZE SECURE COMM
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
