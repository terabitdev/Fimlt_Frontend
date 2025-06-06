import { Plus } from 'lucide-react';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        OutfitBold: ['OutfitBold', 'sans-serif'],
        InterTight: ['Inter', 'sans-serif'],
        Inter: ['Inter', 'sans-serif'],
        Objective: ['Objective', 'sans-serif'],
        proxima: ['Proxima Nova', 'sans-serif'],
        lato: ['Lato', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
        PoppinsSemiBold: ['PoppinsSemiBold', 'sans-serif'],
        ManropeSemiBold: ['ManropeSemiBold', 'sans-serif'],
        monrope: ['Manrope', 'sans-serif'],
        Roboto: ['Roboto', 'sans-serif'],
        PlusJakarta: ['Plus Jakarta', 'sans-serif'],
        SFProDisplay: ['SFProDisplay', 'sans-serif'],
        DMSansRegular: ['DMSans-Regular', 'sans-serif'],
        OutfitBold: ['OutfitBold', 'sans-serif'],
        PublicSansMedium : ['PublicSansMedium', 'sans-serif'],
        Urbanist: ['Urbanist', 'sans-serif'],
      },
      backgroundImage: {
        'blue-darkolive': 'linear-gradient(180deg, #1E3A5F 0%, #090D00 100%)',
      },
    },
  },
  plugins: [
     function ({ addUtilities }) {
      addUtilities({
        ".scrollbar-hide": {
          "scrollbar-width": "none", // Firefox
          "-ms-overflow-style": "none", // IE/Edge
        },
        ".scrollbar-hide::-webkit-scrollbar": {
          display: "none", // Chrome, Safari
        },
        ".scrollbar-thin": {
          "scrollbar-width": "thin", // Firefox
          "-ms-overflow-style": "auto", // IE/Edge
        },
        ".scrollbar-thin::-webkit-scrollbar": {
          width: "8px", // Chrome, Safari
          height: "8px",
        },
                      
      });
    },
  ],
}

