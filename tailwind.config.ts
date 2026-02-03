import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Custom colors untuk mood booster app
        primary: "#8b5cf6", // violet-500
        secondary: "#d946ef", // fuchsia-500
        surface: "#1e293b", // slate-800
        "prio-high": "#f87171", // red-400
        "prio-med": "#fbbf24", // amber-400
        "prio-low": "#34d399", // emerald-400
      },
    },
  },
  plugins: [],
} satisfies Config;
