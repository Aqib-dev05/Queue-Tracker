/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#EDF1EC",
        ink: "#142420",
        teal: {
          DEFAULT: "#1E6E68",
          dark: "#154F4B",
          light: "#2E8A82",
        },
        amber: {
          DEFAULT: "#E7A33E",
          dark: "#C6832A",
        },
        rust: "#C1502E",
        slate: {
          DEFAULT: "#5B6B63",
          light: "#8A968F",
        },
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      backgroundImage: {
        "dot-grid": "radial-gradient(currentColor 1px, transparent 1px)",
      },
      backgroundSize: {
        "dot-grid": "16px 16px",
      },
    },
  },
  plugins: [],
};
