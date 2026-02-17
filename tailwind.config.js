/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./screens/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./global.css",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0B1220",
        card: "#111A2E",
        border: "rgba(255,255,255,0.08)",
        text: "#EAF0FF",
        muted: "#9AA6C0",
        primary: "#6D7CFF",
        primarySoft: "rgba(109,124,255,0.18)",
        success: "#2DD4BF",
        warning: "#FBBF24",
      },
      borderRadius: {
        xl2: "20px",
      },
    },
  },
  plugins: [],
};
