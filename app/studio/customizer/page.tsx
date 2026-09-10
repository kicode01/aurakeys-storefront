import { Metadata } from "next";
import { CustomizerClientWrapper } from "./CustomizerClientWrapper";

export const metadata: Metadata = {
  title: "AuraKeys",
  description:
    "Design and configure your bespoke mechanical keyboard in real-time 3D. Choose your CNC anodization, keycap set, PVD brass weight, and switches.",
};

export default function CustomizerPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen bg-[#07080A] bg-dot-matrix flex flex-col justify-between selection:bg-[#FF4400] selection:text-black">
      <CustomizerClientWrapper />
    </div>
  );
}
