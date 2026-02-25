import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(240 10% 3.9%)", // neutral-950
        foreground: "hsl(0 0% 98%)", // neutral-50
        card: "hsl(240 5.9% 10%)", // neutral-900
        "card-foreground": "hsl(0 0% 98%)",
        popover: "hsl(240 10% 3.9%)",
        "popover-foreground": "hsl(0 0% 98%)",
        primary: {
          DEFAULT: "hsl(47.9 95.8% 53.1%)", // A rich, warm gold
          foreground: "hsl(240 5.9% 10%)",
          darker: "hsl(47.9 95.8% 48.1%)",
        },
        secondary: {
          DEFAULT: "hsl(240 4.8% 95.9%)",
          foreground: "hsl(240 5.9% 10%)",
        },
        muted: {
          DEFAULT: "hsl(240 3.8% 46.1%)",
          foreground: "hsl(240 5% 64.9%)", // neutral-400
        },
        accent: {
          DEFAULT: "hsl(240 4.8% 95.9%)",
          foreground: "hsl(240 5.9% 10%)",
        },
        border: "hsl(240 3.7% 15.9%)", // neutral-800
        input: "hsl(240 3.7% 15.9%)",
        ring: "hsl(47.9 95.8% 53.1%)",
      },
      borderRadius: {
        lg: `0.75rem`,
        md: `calc(0.75rem - 2px)`,
        sm: `calc(0.75rem - 4px)`,
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.12)",
        medium: "0 15px 40px rgba(0,0,0,0.15)",
      },
      transitionTimingFunction: {
        "in-out-circ": "cubic-bezier(0.85, 0, 0.15, 1)",
      },
      animation: {
        "subtle-shine": "subtle-shine 2s ease-in-out infinite",
      },
      keyframes: {
        "subtle-shine": {
          "0%, 100%": { "box-shadow": "0 0 2px 0px hsla(48, 96%, 53%, 0.2)" },
          "50%": { "box-shadow": "0 0 10px 4px hsla(48, 96%, 53%, 0.1)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
