import { create } from "zustand";

interface CursorStore {
  variant: "default" | "hover" | "drag" | "hidden";
  text: string;
  setVariant: (variant: "default" | "hover" | "drag" | "hidden") => void;
  setText: (text: string) => void;
}

export const useCursorStore = create<CursorStore>((set) => ({
  variant: "default",
  text: "",
  setVariant: (variant) => set({ variant }),
  setText: (text) => set({ text }),
}));
