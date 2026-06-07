import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#0a0a0f",
          secondary: "#12121a",
          card: "#16161f",
          hover: "#1c1c26",
        },
        border: {
          DEFAULT: "#27272f",
          light: "#3a3a44",
        },
        text: {
          DEFAULT: "#e5e5e5",
          muted: "#9ca3af",
          dim: "#6b7280",
        },
        accent: {
          DEFAULT: "#6366f1",
          hover: "#4f46e5",
          glow: "#818cf8",
        },
        success: "#10b981",
        danger: "#ef4444",
        warning: "#f59e0b",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;
