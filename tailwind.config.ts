import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./providers/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        aura: {
          dark: "#08090C",
          surface: "#0F1117",
          panel: "#151821",
          card: "#181C26",
          border: "#222634",
          borderSubtle: "rgba(255, 255, 255, 0.08)",
          gold: "#D4AF37",
          goldBright: "#F1CA4B",
          goldMuted: "#9A7E29",
          brass: "#C8A139",
          titanium: "#8F9CAE",
          accent: "#4E7BFF",
          glow: "rgba(212, 175, 55, 0.18)",
        },
        cyber: {
          carbon: "#090A0D",
          surface: "#101217",
          panel: "#161921",
          card: "#181C26",
          orange: "#FF4400",
          orangeBright: "#FF5E20",
          amber: "#FF9500",
          phosphor: "#00E575",
          cyan: "#00F0FF",
          steel: "#272B38",
          border: "rgba(255, 255, 255, 0.08)",
          borderOrange: "rgba(255, 68, 0, 0.4)",
          muted: "#7A8294",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight: "-0.02em",
        wide: "0.02em",
        widest: "0.12em",
      },
      animation: {
        "glow-pulse": "glowPulse 4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
        shimmer: "shimmer 2.5s ease-in-out infinite",
      },
      keyframes: {
        glowPulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.85" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
