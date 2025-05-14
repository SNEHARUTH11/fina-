import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../store/useThemeStore';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="button-3d rounded-full p-2"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
}

export default ThemeToggle;