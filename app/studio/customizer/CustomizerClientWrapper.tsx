"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

// Dynamically import the heavy WebGL component with SSR disabled.
// This prevents the main thread from blocking during the Framer Motion page transition!
const StudioCustomizer = dynamic(
  () => import("@/components/blocks/StudioCustomizer").then((mod) => mod.StudioCustomizer),
  { ssr: false }
);

export function CustomizerClientWrapper() {
  return (
    <Suspense fallback={<div className="w-full h-[520px] flex items-center justify-center text-[#FF4400] font-mono tracking-widest text-xs">INITIALIZING 3D ENGINE...</div>}>
      <StudioCustomizer />
    </Suspense>
  );
}
