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
        "neon-lime": "var(--neon-lime)",
        "neon-purple": "var(--neon-purple)",
        "neon-pink": "var(--neon-pink)",
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
