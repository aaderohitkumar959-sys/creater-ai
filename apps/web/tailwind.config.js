/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Premium dark theme
                background: "#0B0F19",
                surface: "#0F172A",
                "surface-elevated": "#1E293B",
                "surface-hover": "#334155",

                primary: {
                    DEFAULT: "#3B82F6",
                    hover: "#60A5FA",
                    light: "#93C5FD",
                    dark: "#2563EB",
                },

                secondary: {
                    DEFAULT: "#8B5CF6",
                    hover: "#A78BFA",
                    light: "#C4B5FD",
                    dark: "#7C3AED",
                },

                accent: {
                    blue: "#0EA5E9",
                    purple: "#A855F7",
                    pink: "#EC4899",
                    green: "#10B981",
                    yellow: "#F59E0B",
                    red: "#EF4444",
                },

                text: {
                    primary: "#F8FAFC",
                    secondary: "#CBD5E1",
                    muted: "#64748B",
                    disabled: "#475569",
                },

                border: {
                    DEFAULT: "#1E293B",
                    light: "#334155",
                    focus: "#3B82F6",
                },

                // Glassmorphism
                glass: {
                    DEFAULT: "rgba(15, 23, 42, 0.7)",
                    light: "rgba(30, 41, 59, 0.5)",
                    dark: "rgba(11, 15, 25, 0.9)",
                },
            },

            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "gradient-primary": "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                "gradient-hero": "linear-gradient(135deg, #0B0F19 0%, #1E293B 50%, #0B0F19 100%)",
                "gradient-card": "linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)",
            },

            boxShadow: {
                "glow-sm": "0 0 10px rgba(59, 130, 246, 0.3)",
                "glow-md": "0 0 20px rgba(59, 130, 246, 0.4)",
                "glow-lg": "0 0 30px rgba(59, 130, 246, 0.5)",
                "glow-purple": "0 0 20px rgba(139, 92, 246, 0.4)",
                "glow-pink": "0 0 20px rgba(236, 72, 153, 0.4)",
                "premium": "0 10px 40px rgba(0, 0, 0, 0.5), 0 0 20px rgba(59, 130, 246, 0.2)",
                "card": "0 4px 20px rgba(0, 0, 0, 0.3), 0 0 10px rgba(59, 130, 246, 0.1)",
            },

            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
                xl: "1rem",
                "2xl": "1.5rem",
            },

            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                display: ["Inter", "system-ui", "sans-serif"],
                mono: ["Fira Code", "monospace"],
            },

            fontSize: {
                "display-lg": ["4rem", { lineHeight: "1.1", fontWeight: "700" }],
                "display-md": ["3rem", { lineHeight: "1.2", fontWeight: "700" }],
                "display-sm": ["2.25rem", { lineHeight: "1.3", fontWeight: "600" }],
            },

            spacing: {
                18: "4.5rem",
                22: "5.5rem",
                26: "6.5rem",
                30: "7.5rem",
            },

            animation: {
                "fade-in": "fadeIn 0.5s ease-in-out",
                "slide-up": "slideUp 0.5s ease-out",
                "slide-down": "slideDown 0.5s ease-out",
                "scale-in": "scaleIn 0.3s ease-out",
                "glow-pulse": "glowPulse 2s ease-in-out infinite",
                "float": "float 3s ease-in-out infinite",
                "shimmer": "shimmer 2s linear infinite",
            },

            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                slideDown: {
                    "0%": { transform: "translateY(-20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                scaleIn: {
                    "0%": { transform: "scale(0.95)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
                glowPulse: {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.4)" },
                    "50%": { boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-1000px 0" },
                    "100%": { backgroundPosition: "1000px 0" },
                },
            },

            backdropBlur: {
                xs: "2px",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
