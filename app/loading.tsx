export default function Loading() {
  return (
    <div className="min-h-screen bg-aura-dark flex flex-col items-center justify-center p-6 text-neutral-400">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-2 border-aura-border border-t-aura-gold animate-spin" />
        <div className="absolute inset-2 rounded-full border border-neutral-800" />
      </div>
      <p className="font-mono text-xs uppercase tracking-widest text-aura-gold">
        Calibrating Acoustic Profiles...
      </p>
      <span className="text-[11px] text-neutral-600 mt-1 font-mono">
        Streaming Shopify Storefront Data
      </span>
    </div>
  );
}
