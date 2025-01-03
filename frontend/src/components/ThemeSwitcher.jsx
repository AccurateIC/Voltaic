import { useState, useEffect } from 'react';
import { Sun, Moon } from "lucide-react";
import { useMessageBus } from '../lib/MessageBus';

const ThemeSwitcher = ({ size = 64 }) => {
  const publishToMessageBus = useMessageBus('theme-switch'); // create a channel to publish theme switch events
  const prefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      if (prefersDark) return 'business'
      else return 'winter';
    } else return savedTheme;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    publishToMessageBus({ time: Date.now(), message: theme });
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'winter' ? 'business' : 'winter');
  };

  return (
    // <label className="swap swap-rotate hover:scale-110 transition-transform duration-100 ease-in-out btn btn-circle btn-ghost">
    <label className="swap swap-rotate transition-transform duration-100 ease-in-out btn btn-circle btn-ghost">
      <input
        type="checkbox"
        className="theme-controller"
        onChange={toggleTheme}
        checked={theme === 'business'}
      />
      <Sun className="swap-off" size={size} />
      <Moon className="swap-on" size={size} />
    </label>
  );
};

export default ThemeSwitcher;
