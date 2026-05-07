/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        'text-primary': '#0F172A',
        'text-secondary': '#64748B',
        'accent-teal': '#0D9488',
        'accent-blue': '#0EA5E9',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0EA5E9 0%, #0D9488 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(13,148,136,0.08) 100%)',
        'gradient-sidebar-active': 'linear-gradient(90deg, rgba(14,165,233,0.15) 0%, rgba(13,148,136,0.05) 100%)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(0,0,0,0.06)',
      }
    },
  },
  plugins: [],
}
