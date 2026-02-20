/** @type {import('tailwindcss').Config} */
export default {
  // The "**" is the key—it means "search all subdirectories"
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E40AF", // Royal Blue
          dark: "#1E3A8A",
          light: "#DBEAFE",
        },
        medical: {
          900: "#0F172A", // Deep Slate
          500: "#64748B",
          50: "#F8FAFC",
        },
      },
    },
  },
  plugins: [],
};
