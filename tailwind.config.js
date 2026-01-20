/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        cam: { DEFAULT: "#FFB38A", light: "#FFE1D1", dark: "#F98C67" },
        xanh: { DEFAULT: "#6CC3C5", light: "#E9F7F8", dark: "#3CA3A6" },
        vang: { DEFAULT: "#FFD66B", light: "#FFF2C9", dark: "#F8BB30" },
        textmain: "#2F2F3A",
        textmuted: "#6F6F7B",
        bordermuted: "#E3D8CF",
        divider: "#D8C5B8"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Cormorant Garamond', 'serif'],
      },                                
      boxShadow: {
        warm: "0 18px 45px rgba(0,0,0,0.06)",
        frame: "0 10px 28px rgba(0,0,0,0.04)"
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(20px) scale(.995)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" }
        }
      },
      animation: {
        "fade-up": "fadeUp .7s cubic-bezier(.22,1,.36,1) both"
      }
    }
  },
  plugins: []
};
