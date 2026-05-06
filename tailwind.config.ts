import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ["var(--font-inter)", "Inter", "sans-serif"],
        display: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
        accent: ["var(--font-space-grotesk)", "Space Grotesk", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
        destructive: "hsl(var(--destructive))",
        muted: "hsl(var(--muted))",
        accent: "hsl(var(--accent))",
        card: "hsl(var(--card))",
        ok: "hsl(var(--ok))",
        warn: "hsl(var(--warn))",
        critical: "hsl(var(--critical))",
      },
      boxShadow: {
        glow: "0 0 36px hsl(var(--primary) / 0.18)",
        danger: "0 0 40px hsl(var(--critical) / 0.22)",
      },
      borderRadius: {
        data: "6px",
        badge: "4px",
      },
      keyframes: {
        statusPulse: {
          "0%, 100%": { opacity: "0.62", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.28)" },
        },
        criticalBreach: {
          "0%, 100%": { boxShadow: "var(--glow-critical)", borderColor: "hsl(var(--critical) / 0.42)" },
          "50%": { boxShadow: "0 0 34px rgba(239, 68, 68, 0.52)", borderColor: "hsl(var(--critical) / 0.92)" },
        },
        signalBlink: {
          "0%, 100%": { opacity: "0.42" },
          "50%": { opacity: "1" },
        },
        pulseRed: {
          "0%, 100%": { borderColor: "#EF4444", opacity: "1" },
          "50%": { borderColor: "#EF4444", opacity: "0.3" },
        },
      },
      animation: {
        "status-pulse": "statusPulse 1.8s ease-in-out infinite",
        "critical-breach": "criticalBreach 1.4s ease-in-out infinite",
        "signal-blink": "signalBlink 1.1s steps(2, end) infinite",
        "pulse-red": "pulseRed 0.8s ease-in-out infinite",
      },
      backgroundImage: {
        grid: "linear-gradient(hsl(var(--border) / .22) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border) / .22) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
