"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Storefront runtime error caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-aura-dark flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <span className="text-xs font-mono text-rose-400 uppercase tracking-widest">
        Storefront Connection Anomaly
      </span>

      <h1 className="text-3xl font-extrabold text-white mt-2 mb-3">
        Unable to Load Studio Catalog
      </h1>

      <p className="text-sm text-neutral-400 max-w-md mb-8 leading-relaxed">
        {error?.message ||
          "A transient network exception occurred while communicating with the Shopify Storefront GraphQL endpoint."}
      </p>

      <div className="flex items-center gap-3">
        <Button onClick={() => reset()} variant="gold" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </Button>
        <Button
          onClick={() => (window.location.href = "/")}
          variant="outline"
        >
          Return Home
        </Button>
      </div>
    </div>
  );
}
