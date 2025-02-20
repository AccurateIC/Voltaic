import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { useMessageBus } from "../lib/MessageBus";

const ThemeSwitcher = ({ size = 64 }) => {
  const lightTheme = "corporate";
  const darkTheme = "business";
  const publishToMessageBus = useMessageBus("theme-switch");
  const prefersDark = () => window.matchMedia("(prefers-color-scheme: light)").matches;
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (!savedTheme) {
      if (prefersDark) return darkTheme;
      else return lightTheme;
    } else return savedTheme;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    publishToMessageBus({ time: Date.now(), message: theme });
  }, [theme, publishToMessageBus]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === lightTheme ? darkTheme : lightTheme));
  };

  return (
    <>
      <label className="swap swap-rotate transition-transform duration-100 ease-in-out btn btn-circle btn-ghost">
        <input type="checkbox" className="theme-controller" onChange={toggleTheme} checked={theme === "business"} />
        <Sun className="swap-off" size={size} />
        <Moon className="swap-on" size={size} />
      </label>
    </>
  );
};

export default ThemeSwitcher;
