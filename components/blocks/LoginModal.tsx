"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { acousticEngine } from "@/lib/acoustics/engine";
import { Terminal, X, Fingerprint, ShieldAlert, ArrowRight } from "lucide-react";

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login } = useAuthStore();
  const [email, setEmail] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("INVALID CREDENTIALS");
      acousticEngine.playTactileClick("click");
      return;
    }

    setError("");
    setIsAuthenticating(true);
    acousticEngine.playTactileClick("relay");

    // Simulate network delay
    setTimeout(() => {
      login(email);
      setIsAuthenticating(false);
      setEmail("");
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            onClick={() => closeLoginModal()}
            className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-[#090A0D] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none opacity-50" />
              
              <div className="relative z-10 p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="inline-flex items-center gap-2 px-2 py-1 rounded bg-[#FF4400]/10 border border-[#FF4400]/30 text-[#FF4400]">
                    <Terminal className="w-3.5 h-3.5" />
                    <span className="font-mono text-[10px] uppercase font-bold tracking-widest">
                      SECURE TERMINAL
                    </span>
                  </div>
                  <button 
                    onClick={closeLoginModal}
                    className="p-1 text-neutral-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="mb-8">
                  <h2 className="font-display font-black text-3xl text-white uppercase tracking-tight mb-2">
                    OPERATOR LOGIN
                  </h2>
                  <p className="font-sans text-xs text-neutral-400">
                    Authenticate to access your bespoke hardware archive and telemetry dispatch history.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] text-neutral-500 tracking-widest uppercase">
                      CREDENTIAL (EMAIL)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Fingerprint className="w-4 h-4 text-neutral-600" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="operator@domain.com"
                        className={`w-full bg-[#12141A] border ${error ? 'border-red-500' : 'border-white/[0.1]'} rounded-lg py-3 pl-10 pr-4 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#FF4400] transition-colors font-mono`}
                        disabled={isAuthenticating}
                      />
                    </div>
                    {error && (
                      <div className="flex items-center gap-1.5 text-red-500 mt-2">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span className="font-mono text-[10px] tracking-widest">{error}</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full relative mt-6 py-4 bg-[#FF4400] hover:bg-[#FF5511] text-black font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 overflow-hidden group flex items-center justify-center gap-2"
                  >
                    {isAuthenticating ? (
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        VERIFYING HANDSHAKE...
                      </motion.div>
                    ) : (
                      <>
                        <span>INITIALIZE CONNECTION</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-white/[0.08] text-center">
                  <p className="font-mono text-[9px] text-neutral-600 uppercase tracking-widest">
                    No account required for mock prototype. Any email will authenticate.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
