import { useEffect, useMemo, useRef, useState } from 'react';
import { daisyThemeName } from '@/types/schemaOld';
import { z } from 'zod';
import { Icon } from '@iconify/react';
import { fallbackPage, themeIconify } from './utils';
import { WebsitePage, WebsiteTheme } from '@/types/mock';
import { useEditor } from '@/editor/context/EditorContext';

export const fontOptions = [
  { name: 'Inter', preview: 'Modern & Clean' },
  { name: 'Montserrat', preview: 'Elegant & Professional' },
  { name: 'Roboto', preview: 'Friendly & Readable' },
  { name: 'Poppins', preview: 'Geometric & Versatile' },
  { name: 'Playfair', preview: 'Classic & Timeless' },
  { name: 'Lora', preview: 'Elegant & Readable' },
  { name: 'Source Sans Pro', preview: 'Versatile & Neutral' },
  { name: 'Oswald', preview: 'Bold & Impactful' },
  { name: 'Raleway', preview: 'Elegant & Modern' },
  { name: 'Nunito', preview: 'Friendly & Rounded' },
  { name: 'Merriweather', preview: 'Classic & Readable' },
];

const getPageHtml = (
  page: WebsitePage,
  theme: Partial<WebsiteTheme>,
  daisyTheme: daisyThemeName
) => {
  // Compose all sections' HTML and JS
  if (!page || !page.sections || page.sections.length === 0) {
    return fallbackPage;
  }
  const sectionsHtml = page.sections?.map(section => section.src?.html).join('\n');
  const sectionsJs = page.sections?.map(section => section.src?.js).join('\n');
  const sectionsCss = page.sections?.map(section => section.src?.css).join('\n');

  // HTML layout wrapper
  return `
    <!DOCTYPE html>
    <html lang="en" data-theme="${daisyTheme || 'webly-light'}">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${page.page_name}</title>

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?${fontOptions
            .map(font => `family=${font.name}:wght@400;500;600;700`)
            .join('&')}&display=swap"
          rel="stylesheet"
        />

        <!-- Load CSS files first -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css" />
        
        <!-- Load Tailwind and daisyUI libraries -->
        <link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" type="text/css" />
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"><\/script>
        <link href="https://cdn.jsdelivr.net/npm/daisyui@5/themes.css" rel="stylesheet" type="text/css" />

        <!-- Load Iconify and AOS -->
        <script src="https://code.iconify.design/iconify-icon/1.0.8/iconify-icon.min.js"><\/script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js"><\/script>        
       
        
        <script>

          document.addEventListener('DOMContentLoaded', function() {
            
            // Initialize AOS after DOM is loaded
            if (window.AOS) {
              AOS.init({
                duration: 800,
                once: false,
                mirror: false,
                offset: 100,
                delay: 100,
              });
            }
          });
          
          window.addEventListener('resize', function() {
            if (window.AOS) {
              AOS.refresh();
            }
          });
        <\/script>

        <!-- Custom Theme CSS Variables -->
        <style>
        ${generateThemeCSS(theme)}
            html {
                scroll-behavior: smooth;
                 scrollbar-width: thin;
                scrollbar-color: rgba(100, 100, 100, 0.5) transparent;
          }

            body {
                font-family: "${theme?.typography?.fontFamily || 'Roboto'}", system-ui, sans-serif;
                margin: 0;
                padding-bottom: 2rem;
                overflow-x: hidden;
            }
            section {
                padding-top: 1rem;
                padding-bottom: 2rem;
                width: 100%;
            }
            section#header {
                padding-top: 0rem;
                padding-bottom: 0rem;
            }
            .card {
                background-color: color-mix(in srgb, var(--color-base-200) 80%, transparent) !important;
                backdrop-filter: blur(10px);
            }
        </style>
        ${sectionsCss || ''}
      
    </head>

      <body>
        <main class="min-h-screen flex flex-col items-center justify-start bg-[var(--color-background)] text-base-content">
          ${sectionsHtml}
        </main>
        
        <!-- Section-specific scripts -->
        ${sectionsJs}
      </body>

    </html>
  `;
};

const PageParser = () => {
  const [activeIframeIndex, setActiveIframeIndex] = useState(0);
  const [iframeContents, setIframeContents] = useState(['', '']);
  const {
    state: { theme, currentPage, daisyTheme, selectedSectionId, editingMode },
  } = useEditor();
  const page = useMemo(() => ({ ...currentPage }), [currentPage]);

  // Refs for the iframes
  const iframeRefs = [useRef<HTMLIFrameElement>(null), useRef<HTMLIFrameElement>(null)];

  // Generate HTML and update iframe contents
  useEffect(() => {
    const html = getPageHtml(page, theme, daisyTheme);
    const newContents = [...iframeContents];
    const inactiveIndex = activeIframeIndex === 0 ? 1 : 0;

    // Update the inactive iframe content
    newContents[inactiveIndex] = html;
    setIframeContents(newContents);

    // After the inactive iframe has loaded with new content, switch to it
    const iframe = iframeRefs[inactiveIndex].current;
    if (iframe) {
      const handleLoad = () => {
        setActiveIframeIndex(inactiveIndex);
        iframe.removeEventListener('load', handleLoad);
      };

      iframe.addEventListener('load', handleLoad);
    }
  }, [daisyTheme, page, theme.colors, theme.radius]);

  // Change typography font

  useEffect(() => {
    const iframe = iframeRefs[activeIframeIndex].current;
    if (iframe) {
      const style = document.createElement('style');
      style.textContent = `
        body {
          font-family: "${theme?.typography?.fontFamily || 'Roboto'}", system-ui, sans-serif;
        }
      `;
      iframe.contentDocument?.head.appendChild(style);
    }
  }, [activeIframeIndex, theme?.typography?.fontFamily]);

  useEffect(() => {
    const iframe = iframeRefs[activeIframeIndex].current;
    if (iframe && selectedSectionId) {
      const section = iframe.contentDocument?.getElementById(selectedSectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [activeIframeIndex, selectedSectionId]);

  return (
    <>
      <div className="w-full h-[90vh] rounded-lg overflow-hidden border border-zinc-400/10 shadow-lg">
        {/* {editingMode === 'theme' && <ThemeSwitcher />} */}
        {/* Two iframes with absolute positioning for smooth transitions */}
        <div className="relative w-full min-h-screen* h-full">
          {[0, 1].map(index => (
            <iframe
              key={index}
              ref={iframeRefs[index]}
              title={`${page.page_name}-${index}`}
              sandbox="allow-scripts allow-same-origin"
              srcDoc={iframeContents[index]}
              className={`absolute scroll-smooth top-0 left-0 w-full min-h-[stretch] transition-opacity duration-300`}
              style={{
                opacity: activeIframeIndex === index ? 1 : 0,
                zIndex: activeIframeIndex === index ? 10 : 1,
                pointerEvents: activeIframeIndex === index ? 'auto' : 'none',
              }}
              frameBorder="0"
            />
          ))}
        </div>
      </div>
    </>
  );
};

export const ThemeSwitcher = ({ ...props }): JSX.Element => {
  const {
    state: { daisyTheme },
    actions: { setDaisyTheme },
  } = useEditor();

  const handleThemeChange = (newTheme: daisyThemeName) => {
    setDaisyTheme(newTheme);
  };

  return (
    <div
      {...props}
      className="scrollbar-thin flex overflow-x-auto gap-4 mb-0.5 max-sm:overflow-x-auto justify-center items-center backdrop-blur-xl mx-auto rounded-lg z-10"
    >
      {Object.entries(themeIconify).map(([key, icon]) => (
        <button
          key={key}
          className={`btn btn-xs btn-square ${daisyTheme === key ? 'btn-primary' : 'btn-ghost'} ${
            ['webly-light', 'webly-dark'].includes(key) ? 'border border-base-300' : ''
          } tooltip tooltip-top`}
          data-tip={key}
          onClick={() => handleThemeChange(key as daisyThemeName)}
        >
          <Icon icon={icon} fontSize={12} className="mx-auto" />
        </button>
      ))}
    </div>
  );
};

/**
 * Generate CSS for daisyUI themes according to the CDN usage pattern
 */
const generateThemeCSS = (theme: Partial<WebsiteTheme>): string => {
  if (!theme || !theme.colors) {
    return '';
  }

  const { colors, typography, radius } = theme;
  const light = colors?.light || {};
  const dark = colors?.dark || {};

  // Convert colors to OKLCH format for daisyUI
  const lightThemeVars = generateThemeVariablesHex(light, typography, radius, 'light');
  const darkThemeVars = generateThemeVariablesHex(dark, typography, radius, 'dark');

  return `
    /* Light Theme */
    [data-theme="webly-light"] {
      color-scheme: light;
      ${lightThemeVars}
    }
    
    /* Dark Theme */
    [data-theme="webly-dark"] {
      color-scheme: dark;
      ${darkThemeVars}
    }
  `;
};

/**
 * Generate theme variables in the OKLCH format for daisyUI
 */
const generateThemeVariablesHex = (
  colors: any,
  typography: any,
  radius: any,
  mode: 'light' | 'dark'
): string => {
  if (!colors) return '';

  const primary = colors.primary
    ? colors.primary
    : mode === 'light'
    ? '#3B82F6' // Vibrant blue
    : '#60A5FA'; // Lighter blue for dark mode
  const secondary = colors.secondary
    ? colors.secondary
    : mode === 'light'
    ? '#8B5CF6' // Vibrant purple
    : '#A78BFA'; // Lighter purple for dark mode
  const accent = colors.accent
    ? colors.accent
    : mode === 'light'
    ? '#EC4899' // Vibrant pink
    : '#F472B6'; // Lighter pink for dark mode
  const background = colors.background
    ? colors.background
    : mode === 'light'
    ? '#FFFFFF' // Clean white
    : '#111827'; // Rich dark background
  const card = colors.card
    ? colors.card
    : mode === 'light'
    ? '#F3F4F6' // Light gray
    : '#1F2937'; // Dark gray for cards in dark mode
  const text = colors.text
    ? colors.text
    : mode === 'light'
    ? '#111827' // Near black
    : '#F9FAFB'; // Near white for dark mode
  const border = colors.border
    ? colors.border
    : mode === 'light'
    ? '#E5E7EB' // Light border
    : '#374151'; // Dark border for dark mode

  const baseColors = generateBaseColors(background);

  // Generate CSS variables
  return `
    /* Base colors */
    --color-primary: ${primary};
    --color-primary-content: ${mode === 'light' ? '#F8FAFC' : '#1E293B'};
    --color-secondary: ${secondary};
    --color-secondary-content: ${mode === 'light' ? '#F8FAFC' : '#1E293B'};
    --color-accent: ${accent};
    --color-accent-content: ${mode === 'light' ? '#F8FAFC' : '#1E293B'};
    --color-border: ${border};
    
    /* Background and content */
    --color-background: ${background};
    --color-bc: ${background};
    --color-base-100: ${baseColors.base100};
    --color-base-200: ${card};
    --color-base-300: ${baseColors.base300};
    --color-base-content: ${text};

    /* Neutral colors */
    --color-card: ${card};
    --color-neutral: ${card};
    --color-neutral-content: ${mode === 'light' ? '#1E293B' : '#F8FAFC'};
    
    /* State colors */
    --color-info: ${primary};
    --color-info-content: ${mode === 'light' ? '#F8FAFC' : '#1E293B'};
    --color-success: ${secondary};
    --color-success-content: ${mode === 'light' ? '#F8FAFC' : '#1E293B'};
    --color-warning: ${accent};
    --color-warning-content: ${mode === 'light' ? '#1E293B' : '#F8FAFC'};
    --color-error: ${mode === 'light' ? '#EF4444' : '#EF4444'};
    --color-error-content: ${mode === 'light' ? '#F8FAFC' : '#F8FAFC'};
    
    /* Border radius */
    --radius-selector: ${radius?.button || 6}px;
    --radius-field: ${radius?.button || 6}px;
    --radius-box: ${radius?.card || 1}px;

    /* Typography */
    --font-family: "${typography?.fontFamily || 'Montserrat'}", system-ui, sans-serif;
    
    /* Additional daisyUI variables */
    --rounded-box: ${radius?.card || 1}px;
    --rounded-card: ${radius?.card || 1}px;
    --rounded-btn: ${radius?.button || 0.5}px;
    --rounded-badge: 1.9rem;
        `;
};

const hexToHsl = (hex: string) => {
  // Convert hex to RGB
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  // Find min and max values
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  // Calculate lightness
  const l = (max + min) / 2;

  // Calculate saturation
  let s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  // Calculate hue
  let h;
  if (delta === 0) {
    h = 0; // achromatic
  } else if (max === r) {
    h = ((g - b) / delta + (g < b ? 6 : 0)) * (360 / 6);
  } else if (max === g) {
    h = ((b - r) / delta + 2) * (360 / 6);
  } else {
    h = ((r - g) / delta + 4) * (360 / 6);
  }

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
};

/**
 * Generates base-100, base-200, and base-300 colors for daisyUI theme based on background color
 * @param backgroundColor - Hex color string for the background (e.g., '#FFFFFF')
 * @returns Object with base-100, base-200, and base-300 hex color values
 */
function generateBaseColors(backgroundColor: string) {
  // Step 1: Convert hex to HSL for easier manipulation
  const { h, s, l } = hexToHsl(backgroundColor);

  // Step 2: Determine if we're working with a light or dark background
  const isLight = l > 50;

  // Step 3: Calculate adjustment factors based on starting lightness
  let adjustmentFactor;
  if (isLight) {
    // For light backgrounds, we want more noticeable but subtle steps down
    adjustmentFactor = Math.max(5, Math.min(8, l * 0.08));
  } else {
    // For dark backgrounds, we need smaller steps to maintain readability
    adjustmentFactor = Math.max(3, Math.min(6, (100 - l) * 0.07));
  }

  // Step 4: Calculate lightness values for our three base colors
  const l100 = l; // base-100 is the original background
  const l200 = isLight
    ? Math.max(l - adjustmentFactor, 10) // Darken for light mode
    : Math.min(l + adjustmentFactor, 90); // Lighten for dark mode
  const l300 = isLight
    ? Math.max(l - adjustmentFactor * 2, 5) // Darken more
    : Math.min(l + adjustmentFactor * 2, 95); // Lighten more

  // Step 5: Convert back to hex colors
  const base100 = backgroundColor;
  const base200 = hslToHex(h, s, l200);
  const base300 = hslToHex(h, s, l300);

  return {
    base100,
    base200,
    base300,
  };
}

/**
 * Converts HSL values to a hex color string
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns Hex color string (e.g., '#FFFFFF')
 */
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;

  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };

  return `#${f(0)}${f(8)}${f(4)}`;
}

export default PageParser;
