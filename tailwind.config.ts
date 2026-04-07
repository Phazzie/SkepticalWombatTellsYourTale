import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "neon-lime": "rgb(var(--neon-lime-rgb) / <alpha-value>)",
        "neon-lime-dim": "rgb(var(--neon-lime-rgb) / 0.14)",
        "neon-lime-border": "rgb(var(--neon-lime-rgb) / 0.35)",
        "neon-purple": "rgb(var(--neon-purple-rgb) / <alpha-value>)",
        "neon-purple-dim": "rgb(var(--neon-purple-rgb) / 0.12)",
        "neon-purple-border": "rgb(var(--neon-purple-rgb) / 0.35)",
        "neon-pink": "rgb(var(--neon-pink-rgb) / <alpha-value>)",
        "neon-pink-dim": "rgb(var(--neon-pink-rgb) / 0.12)",
        "neon-pink-border": "rgb(var(--neon-pink-rgb) / 0.35)",
      },
      boxShadow: {
        "neon-lime": "var(--shadow-neon-lime)",
        "neon-purple": "var(--shadow-neon-purple)",
        "neon-pink": "var(--shadow-neon-pink)",
        "neon-indigo": "var(--shadow-neon-indigo)",
      },
    },
  },
  plugins: [],
};
export default config;
