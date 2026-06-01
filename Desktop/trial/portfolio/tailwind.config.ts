import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--color-canvas) / <alpha-value>)",
        panel: "rgb(var(--color-panel) / <alpha-value>)",
        elevated: "rgb(var(--color-elevated) / <alpha-value>)",
        line: "rgb(var(--color-line) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        muted: "rgb(var(--color-muted) / <alpha-value>)",
        dim: "rgb(var(--color-dim) / <alpha-value>)",
        blue: "rgb(var(--color-blue) / <alpha-value>)",
        cyan: "rgb(var(--color-cyan) / <alpha-value>)",
        violet: "rgb(var(--color-violet) / <alpha-value>)",
        lime: "rgb(var(--color-lime) / <alpha-value>)",
        amber: "rgb(var(--color-amber) / <alpha-value>)",
        danger: "rgb(var(--color-danger) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "DM Mono", "monospace"],
        display: ["Bebas Neue", "Inter", "sans-serif"],
        serif: ["Instrument Serif", "serif"],
      },
      boxShadow: {
        glow: "0 0 40px rgb(var(--color-blue) / 0.14)",
        soft: "0 32px 90px rgb(0 0 0 / 0.38)",
      },
      keyframes: {
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0" } },
        pulseDot: {
          "0%,100%": { boxShadow: "0 0 0 0 rgb(var(--color-lime) / 0.35)" },
          "50%": { boxShadow: "0 0 0 7px rgb(var(--color-lime) / 0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        blink: "blink 1.2s step-end infinite",
        pulseDot: "pulseDot 2s ease-in-out infinite",
        marquee: "marquee 22s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
