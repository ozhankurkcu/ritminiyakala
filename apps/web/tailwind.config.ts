import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      sm:  '811px',
      md:  '811px',
      lg:  '1024px',
      xl:  '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          50:  "#F3E8FF",
          100: "#E9D5FF",
          200: "#D8B4FE",
          300: "#C084FC",
          400: "#A855F7",
          500: "#9333EA",
          600: "#7E22CE",
          700: "#631C99",
          800: "#581C87",
          900: "#3F0F5C",
          DEFAULT: "#631C99",
        },
        secondary: {
          DEFAULT: "#FF7E00",
          light:   "#FB923C",
          dark:    "#C2410C",
        },
        accent: {
          DEFAULT: "#60E1EB",
          dark:    "#2DB8C0",
        },
        brand: {
          fume:        "#696969",
          intLink:     "#2DB8C0",
          extLink:     "#808080",
          lightBg:     "#F8F8F6",
          darkBg:      "#1A1A1A",
          border:      "#E0E0E0",
          borderDark:  "#333333",
        },
        status: {
          success: "#22C55E",
          warning: "#EAB308",
          error:   "#EF4444",
          pending: "#F97316",
        },
      },
      fontFamily: {
        heading: ["Montserrat", "sans-serif"],
        body:    ["Nunito Sans", "sans-serif"],
        sans:    ["Nunito Sans", "sans-serif"],
      },
      fontSize: {
        xs:   ["12px", { lineHeight: "16px" }],
        sm:   ["14px", { lineHeight: "20px" }],
        base: ["16px", { lineHeight: "24px" }],
        lg:   ["18px", { lineHeight: "28px" }],
        xl:   ["20px", { lineHeight: "28px" }],
        "2xl":["24px", { lineHeight: "32px" }],
        "3xl":["32px", { lineHeight: "40px" }],
        "4xl":["40px", { lineHeight: "48px" }],
      },
      borderRadius: {
        sm:   "2px",
        md:   "4px",
        lg:   "8px",
        xl:   "16px",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0,0,0,0.05)",
        md: "0 4px 6px -1px rgba(0,0,0,0.1)",
        lg: "0 10px 15px -3px rgba(0,0,0,0.1)",
        xl: "0 20px 25px -5px rgba(0,0,0,0.1)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
  ],
};
export default config;
