'use client';

import { useTheme, type Theme } from './theme-provider';
import { useState } from 'react';
import { Icon } from '@iconify/react';

// Theme categories for better organization
const themeCategories = {
  base: ['light', 'dark', 'system'],
  colorful: ['cupcake', 'bumblebee', 'emerald', 'corporate', 'synthwave', 'retro', 'cyberpunk'],
  seasonal: ['valentine', 'halloween', 'autumn', 'winter'],
  nature: ['garden', 'forest', 'aqua', 'lemonade'],
  aesthetic: ['lofi', 'pastel', 'fantasy', 'wireframe', 'black', 'luxury', 'dracula', 'cmyk'],
  mood: ['business', 'acid', 'night', 'coffee', 'caramellatte'],
};

// Theme icons using Iconify
const themeIconify: Record<string, string> = {
  light: 'ph:sun-bold',
  dark: 'ph:moon-bold',
  system: 'ph:desktop-bold',
  cupcake: 'mdi:cupcake',
  bumblebee: 'fa-solid:bumblebee',
  emerald: 'fa6-solid:gem',
  corporate: 'mdi:office-building',
  synthwave: 'mdi:sine-wave',
  retro: 'ic:baseline-tv-old',
  cyberpunk: 'mdi:robot',
  valentine: 'mdi:heart',
  halloween: 'fa6-solid:pumpkin',
  garden: 'mdi:flower',
  forest: 'mdi:pine-tree',
  aqua: 'mdi:water',
  lofi: 'mdi:radio-vintage',
  pastel: 'mdi:palette-swatch',
  fantasy: 'mdi:wizard-hat',
  wireframe: 'mdi:pencil-ruler',
  black: 'mdi:circle',
  luxury: 'mdi:crown',
  dracula: 'mdi:vampire',
  cmyk: 'mdi:printer',
  autumn: 'mdi:leaf-maple',
  business: 'mdi:briefcase',
  acid: 'mdi:flask',
  lemonade: 'mdi:lemon',
  night: 'mdi:weather-night',
  coffee: 'mdi:coffee',
  winter: 'mdi:snowflake',
  caramellatte: 'mdi:coffee-to-go',
};

// Fallback to emoji if Iconify icon is not available
const themeEmoji: Record<string, string> = {
  light: '☀️',
  dark: '🌙',
  system: '💻',
  cupcake: '🧁',
  bumblebee: '🐝',
  emerald: '💎',
  corporate: '🏢',
  synthwave: '🌃',
  retro: '📺',
  cyberpunk: '🤖',
  valentine: '💘',
  halloween: '🎃',
  garden: '🌷',
  forest: '🌲',
  aqua: '💧',
  lofi: '📻',
  pastel: '🎨',
  fantasy: '🧙',
  wireframe: '📝',
  black: '⚫',
  luxury: '👑',
  dracula: '🧛',
  cmyk: '🖨️',
  autumn: '🍂',
  business: '💼',
  acid: '🧪',
  lemonade: '🍋',
  night: '🌌',
  coffee: '☕',
  winter: '❄️',
  caramellatte: '🍮',
};

export function ThemeToggle() {
  const { theme, setTheme, isDarkTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('base');

  // Function to apply theme
  const applyTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  return (
    <div className="dropdown dropdown-end">
      {/* Toggle button with current theme icon */}
      <div 
        tabIndex={0} 
        role="button" 
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-ghost btn-sm btn-circle"
      >
        { isDarkTheme ? (
          <Icon icon="ph:moon-bold" className="h-4 w-4" />
        ) : (
          <Icon icon="ph:sun-bold" className="h-4 w-4" />
        )}
      </div>

      {/* Theme selector dropdown */}
      {isOpen && (
        <div 
          tabIndex={0} 
          className="dropdown-content z-[10] p-3 shadow-lg bg-base-100 rounded-box min-w-64 right-0 mt-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col gap-3">
            {/* Category tabs */}
            <div className="tabs tabs-boxed flex overflow-x-auto">
              {Object.keys(themeCategories).map((category) => (
                <a 
                  key={category}
                  className={`tab text-xs ${activeCategory === category ? 'tab-active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </a>
              ))}
            </div>
            
            {/* Theme options for selected category */}
            <div className="grid grid-cols-3 gap-1 pt-1 max-h-[30vh] overflow-y-auto">
              {themeCategories[activeCategory as keyof typeof themeCategories].map((themeName) => (
                <button
                  key={themeName}
                  className={`btn btn-xs ${theme === themeName ? 'btn-primary' : 'btn-ghost'} flex items-center justify-center p-2 h-auto min-h-0 m-0.5`}
                  onClick={() => applyTheme(themeName as Theme)}
                >
                  <span className="mr-1 text-xs">
                    {themeIconify[themeName] ? (
                      <Icon icon={themeIconify[themeName]} width="14" height="14" />
                    ) : (
                      themeEmoji[themeName] || '🎨'
                    )}
                  </span>
                  <span className="text-xs capitalize truncate">{themeName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}