"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/lib/shopify/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/useCartStore";
import { acousticEngine } from "@/lib/acoustics/engine";
import { ShoppingBag, Check, Box } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const variants = product.variants.edges.map((e) => e.node);
  const activeVariant = variants[selectedVariantIndex] || variants[0];
  const price = activeVariant ? parseFloat(activeVariant.price.amount) : parseFloat(product.priceRange.minVariantPrice.amount);
  const currency = activeVariant ? activeVariant.price.currencyCode : product.priceRange.minVariantPrice.currencyCode;
  const modelId = product.handle.replace(/^aura-/, "");

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeVariant) return;

    acousticEngine.playTactileClick("relay");

    addItem({
      id: `${product.id}-${activeVariant.id}`,
      productId: product.id,
      variantId: activeVariant.id,
      title: product.title,
      variantTitle: activeVariant.title,
      price: price,
      currencyCode: currency,
      image: product.featuredImage?.url || "/images/products/titan-65.jpg",
    });

    setIsAddedRecently(true);
    setTimeout(() => {
      setIsAddedRecently(false);
      openCart();
    }, 400);
  };

  return (
    <div
      onClick={() => {
        acousticEngine.playTactileClick("click");
        router.push(`/products/${product.handle}`);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col h-full rounded-2xl bg-[#0D0F14] border border-white/[0.08] hover:border-[#FF4400]/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgba(255,68,0,0.14)] cursor-pointer"
    >
      {/* Corner Hex Bolts */}
      <div className="absolute top-2.5 left-2.5 text-[9px] font-mono text-neutral-600 pointer-events-none z-20 select-none">
        ⊕
      </div>
      <div className="absolute top-2.5 right-2.5 text-[9px] font-mono text-neutral-600 pointer-events-none z-20 select-none">
        ⊕
      </div>

      {/* Product Image Stage */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/60 border-b border-white/[0.06]">
        {product.featuredImage?.url && (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText || product.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className={`object-cover object-center transition-transform duration-500 ease-out ${
              isHovered ? "scale-105" : "scale-100"
            }`}
          />
        )}

        {/* Top Format Badges */}
        <div className="absolute top-3 left-6 flex flex-wrap gap-1.5 z-10">
          {product.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-sm border border-white/[0.12] text-[#FF4400] uppercase tracking-wider"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Price Tag */}
        <div className="absolute top-3 right-6 z-10 font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-black shadow-sm">
          {formatPrice(price, currency)}
        </div>

        {/* Subtle Bottom Technical Overlay Bar */}
        <div className="absolute bottom-1.5 left-3 right-3 font-mono text-[9px] text-neutral-400 flex justify-between pointer-events-none tracking-wider">
          <span>// BILLET 6063</span>
          <span>1000Hz VIA</span>
        </div>
      </div>

      {/* Card Body & Technical Specifications */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3.5">
        <div>
          <h3 className="font-display font-bold text-base text-white group-hover:text-[#FF4400] transition-colors tracking-tight leading-snug">
            {product.title}
          </h3>
          <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed font-sans">
            {product.description}
          </p>

          {/* Switch Variant Selector Pills */}
          {variants.length > 1 && (
            <div className="mt-3.5 flex flex-wrap gap-1.5">
              {variants.map((variant, idx) => {
                const switchOption = variant.selectedOptions.find((o) => o.name.toLowerCase() === "switch")?.value;
                const label = switchOption || variant.title.split("/")[1] || variant.title;

                return (
                  <button
                    key={variant.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      acousticEngine.playTactileClick("click");
                      setSelectedVariantIndex(idx);
                    }}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded-md border transition-colors ${
                      selectedVariantIndex === idx
                        ? "border-[#FF4400] bg-[#FF4400]/15 text-[#FF4400] font-bold"
                        : "border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:text-white"
                    }`}
                  >
                    {label.trim()}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions: Add to Bag + 3D Studio Shortcut */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            className={`flex-1 py-2 px-3 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:translate-y-0.5 ${
              isAddedRecently
                ? "bg-[#00E575] text-black shadow-[0_0_15px_rgba(0,229,117,0.4)]"
                : "bg-white/[0.06] hover:bg-[#FF4400] hover:text-black border border-white/[0.12] hover:border-[#FF4400] text-white"
            }`}
          >
            {isAddedRecently ? (
              <>
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>[ ADDED TO BAG ]</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>ADD TO BAG</span>
              </>
            )}
          </button>

          <Link
            href={`/studio/customizer?model=${modelId}`}
            onClick={() => acousticEngine.playTactileClick("click")}
            className="py-2 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.09] border border-white/[0.1] hover:border-white/[0.2] text-neutral-300 hover:text-white transition-all text-xs font-mono flex items-center gap-1.5 flex-shrink-0"
            title={`Customize ${product.title} in 3D Studio`}
          >
            <Box className="w-3.5 h-3.5 text-[#FF4400]" />
            <span className="text-[11px] font-bold">3D</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
