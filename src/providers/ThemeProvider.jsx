"use client";

import { useEffect } from "react";
import { themeChange } from "theme-change";

const ThemeProvider = ({ children }) => {
  useEffect(() => {
    themeChange(false); // init theme-change

    // 1️⃣ Load saved theme on first load
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      document.documentElement.setAttribute("data-theme", savedTheme);
    }

    // 2️⃣ Listen to theme-change and store the selected theme
    const handler = (e) => {
      const newTheme = e.detail;
      localStorage.setItem("theme", newTheme);
    };

    window.addEventListener("theme-change", handler);

    return () => {
      window.removeEventListener("theme-change", handler);
    };
  }, []);

  return <>{children}</>;
};

export default ThemeProvider;
