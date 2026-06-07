import { useEffect, useState } from "react";
import { FaSun, FaMoon, FaPalette, FaCheck } from "react-icons/fa";

const themes = [
  "light", "dark", "cupcake", "bumblebee", "emerald", "corporate",
  "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden",
  "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black",
  "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade",
  "night", "coffee", "winter", "dim", "nord", "sunset"
];

const ThemeToggle = () => {
  const [currentTheme, setCurrentTheme] = useState("light");

  useEffect(() => {
    const initThemeChange = async () => {
      const { themeChange } = await import("theme-change");
      themeChange(false);
    };
    initThemeChange();

    const saved = localStorage.getItem("theme");
    if (saved) setCurrentTheme(saved);
  }, []);

  const handleThemeSelect = (theme) => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    setCurrentTheme(theme);
  };

  return (
    <div className="dropdown dropdown-end">
      {/* Button */}
      <div
        tabIndex={0}
        role="button"
        className="btn btn-circle btn-ghost hover:scale-110 transition"
        title="Change Theme"
      >
        <FaPalette className="w-5 h-5" />
      </div>

      {/* Dropdown */}
      <div
        tabIndex={0}
        className="dropdown-content bg-base-100 rounded-xl shadow-xl mt-3 w-72 p-4 border border-base-300"
      >
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <FaPalette /> Choose Theme
        </h3>

        {/* Grid Preview */}
        <div className="grid grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-1">
          {themes.map((theme) => (
            <button
              key={theme}
              onClick={() => handleThemeSelect(theme)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border 
                hover:bg-base-200 transition cursor-pointer
                ${currentTheme === theme ? "border-primary bg-base-200" : "border-base-300"}
              `}
            >
              <div
                className={`w-10 h-10 rounded-full border flex items-center justify-center`}
                style={{
                  background: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
                }}
              >
                {currentTheme === theme && <FaCheck className="text-base-100" />}
              </div>
              <span className="text-xs capitalize">{theme}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeToggle;
