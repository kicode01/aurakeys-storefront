import type { Metadata } from "next";
import { Outfit, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScrollProvider } from "@/providers/SmoothScrollProvider";
import { MotionProvider } from "@/providers/MotionProvider";
import { ConsentProvider } from "@/providers/ConsentProvider";
import { Navbar } from "@/components/blocks/Navbar";
import { CartDrawer } from "@/components/blocks/CartDrawer";
import { LoginModal } from "@/components/blocks/LoginModal";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AuraKeys",
  description:
    "Hand-crafted, CNC-machined aerospace aluminum keyboards with leaf-spring acoustic tuning, PVD brass weights, and artisan switches.",
  icons: {
    icon: "/logo-v2.jpg",
  },
  keywords: [
    "AuraKeys",
    "mechanical keyboard",
    "custom keyboard",
    "luxury keyboard",
    "aluminum keyboard",
    "gasket mount",
    "tactile switches",
    "Shopify headless",
  ],
  openGraph: {
    title: "AuraKeys",
    description:
      "Precision-milled mechanical keyboards, hand-assembled with acoustic resonance chambers, mirror PVD brass weights, and bespoke switches.",
    url: "https://aurakeys.com",
    siteName: "AuraKeys",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} font-sans bg-[#090A0D] text-neutral-100 antialiased selection:bg-[#FF4400] selection:text-white`}
      >
        <ConsentProvider>
          <SmoothScrollProvider>
            <MotionProvider>
              <Navbar />
              <CartDrawer />
              <LoginModal />
              <main className="relative flex flex-col min-h-screen">
                {children}
              </main>
            </MotionProvider>
          </SmoothScrollProvider>
        </ConsentProvider>
      </body>
    </html>
  );
}
