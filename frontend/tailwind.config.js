/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  // Varian hover: hanya aktif di perangkat yang benar-benar punya hover.
  // Tanpa ini, iOS menerapkan hover saat elemen disentuh sehingga efek
  // transform-nya membuat lapisan render baru yang lolos dari filter warna.
  future: {
    hoverOnlyWhenSupported: true
  },
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'body': ['DM Sans', 'Inter', 'sans-serif'],
        'wordmark': ['Inter', 'sans-serif'],
      },
      colors: {
        'bg-primary': '#0d1117',
        'bg-secondary': '#161b22',
        'bg-elevated': '#21262d',
        'text-primary': '#f0f6fc',
        'text-secondary': '#8b949e',
        'text-tertiary': '#6e7681',
        'accent': '#d65a3a',
        'accent-hover': '#e87355',
        'border-subtle': '#30363d',
        'border-emphasis': '#484f58',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}