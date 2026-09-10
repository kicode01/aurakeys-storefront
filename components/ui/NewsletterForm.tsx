"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";
import { acousticEngine } from "@/lib/acoustics/engine";

export function NewsletterForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    acousticEngine.playTactileClick("relay");
    setStatus("loading");

    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
      acousticEngine.playTactileClick("click");
      
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }, 800);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="operator@domain.com"
        disabled={status !== "idle"}
        className="bg-[#12141A] border border-white/[0.1] px-3 py-2 rounded-lg text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#FF4400] w-full disabled:opacity-50 transition-colors"
      />
      <button 
        type="submit"
        disabled={status !== "idle"}
        className="p-2 rounded-lg bg-[#FF4400] text-black hover:bg-[#FF5511] disabled:bg-[#FF4400]/50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
        aria-label="Subscribe"
      >
        {status === "success" ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Send className={`w-3.5 h-3.5 ${status === "loading" ? "animate-pulse" : ""}`} />
        )}
      </button>
    </form>
  );
}
