// 📄 /context/ThemeContext.js
import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [mode, setMode] = useState("light");

    useEffect(() => {
        const stored = localStorage.getItem("theme");
        if (stored) setMode(stored);
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", mode);
        localStorage.setItem("theme", mode);
    }, [mode]);

    const toggleTheme = () => {
        setMode((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);
