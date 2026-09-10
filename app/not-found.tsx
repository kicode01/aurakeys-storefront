import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-aura-dark flex flex-col items-center justify-center p-6 text-center">
      <span className="text-xs font-mono text-aura-gold uppercase tracking-widest">
        Error 404
      </span>
      <h1 className="text-4xl font-extrabold text-white mt-2 mb-3">
        Edition Not Found
      </h1>
      <p className="text-sm text-neutral-400 max-w-sm mb-8 leading-relaxed">
        The keyboard layout, switch archive, or collection edition you are seeking has been decommissioned or moved.
      </p>
      <Link href="/">
        <Button variant="gold">
          Return to Studio
        </Button>
      </Link>
    </div>
  );
}
