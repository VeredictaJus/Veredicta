import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";
import tailwindcssAspectRatio from "@tailwindcss/aspect-ratio";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  safelist: [
    'bg-amber-100',
    'text-amber-700',
    'bg-orange-100',
    'text-orange-700',
    'bg-orange-200',
    'text-orange-800',
    'bg-emerald-100',
    'text-emerald-700',
    'bg-violet-100',
    'text-violet-700',
    'bg-blue-100',
    'text-blue-700',
    'bg-cyan-100',
    'text-cyan-700',
    'bg-slate-100',
    'text-slate-700',
    'dark:bg-amber-900/30',
    'dark:text-amber-400',
    'dark:bg-orange-900/30',
    'dark:text-orange-400',
    'dark:bg-orange-900/40',
    'dark:text-orange-300',
    'dark:bg-emerald-900/30',
    'dark:text-emerald-400',
    'dark:bg-violet-900/30',
    'dark:text-violet-400',
    'dark:bg-blue-900/30',
    'dark:text-blue-400',
    'dark:bg-cyan-900/30',
    'dark:text-cyan-400',
    'dark:bg-slate-800',
    'dark:text-slate-300',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(20, 100%, 55%)", // Orange primary
          foreground: "hsl(0, 0%, 98%)",
          50: "hsl(22, 100%, 95%)",
          100: "hsl(22, 100%, 90%)",
          200: "hsl(22, 100%, 80%)",
          300: "hsl(22, 100%, 70%)",
          400: "hsl(22, 100%, 60%)",
          500: "hsl(20, 100%, 55%)",
          600: "hsl(18, 100%, 50%)",
          700: "hsl(16, 100%, 45%)",
          800: "hsl(14, 100%, 40%)",
          900: "hsl(12, 100%, 35%)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(22, 80%, 92%)", // Light orange accent
          foreground: "hsl(14, 100%, 40%)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      container: {
        primary: "hsl(var(--container-primary))",
        secondary: "hsl(var(--container-secondary))",
        inner: "hsl(var(--container-inner))",
      },
        orange: {
          50: "hsl(22, 100%, 95%)",
          100: "hsl(22, 100%, 90%)",
          200: "hsl(22, 100%, 80%)",
          300: "hsl(22, 100%, 70%)",
          400: "hsl(22, 100%, 60%)",
          500: "hsl(20, 100%, 55%)",
          600: "hsl(18, 100%, 50%)",
          700: "hsl(16, 100%, 45%)",
          800: "hsl(14, 100%, 40%)",
          900: "hsl(12, 100%, 35%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate, tailwindcssAspectRatio],
} satisfies Config;