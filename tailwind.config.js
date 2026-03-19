/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50:"#fdf9ec",100:"#f9efc4",200:"#f2d97a",300:"#e9bc36",
          400:"#d4a017",500:"#b8860b",600:"#9a6f08",700:"#7a5506",
          800:"#5c3f05",900:"#3d2a03",
        },
      },
      fontFamily: {
        display: ["'Cinzel'","serif"],
        mono:    ["'JetBrains Mono'","monospace"],
        body:    ["'DM Sans'","sans-serif"],
      },
    },
  },
  plugins: [],
};
