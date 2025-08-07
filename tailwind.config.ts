/** @type {import('tailwindcss').Config} */
   export default {
     content: [
       './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
       './src/components/**/*.{js,ts,jsx,tsx,mdx}',
       './src/app/**/*.{js,ts,jsx,tsx,mdx}',
     ],
     theme: {
       extend: {
         colors: {
           background: '#F5F5F5',
           primary: '#2563EB',
           secondary: '#4B5563',
         },
       },
     },
     plugins: [],
   };