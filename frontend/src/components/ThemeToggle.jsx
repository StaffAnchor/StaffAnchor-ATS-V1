import React from 'react';
import sun from '../assets/sun.svg';
import moon from '../assets/moon.svg';

const ThemeToggle = ({ darkMode, setDarkMode }) => (
  <button
    className="theme-toggle"
    onClick={() => setDarkMode(!darkMode)}
    title="Toggle theme"
    aria-label="Toggle dark mode"
    type="button"
  >
    <img src={darkMode ? moon : sun} alt={darkMode ? 'Dark mode' : 'Light mode'} width={24} height={24} />
  </button>
);

export default ThemeToggle;
