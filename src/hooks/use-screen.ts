import { useMediaQuery } from 'react-responsive';

// Common breakpoints (can be adjusted based on your needs)
export const BREAKPOINTS = {
  xs: 320,
  sm: 540,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

export function useBreakpoint() {
  const isSmallMobile = useMediaQuery({ maxWidth: BREAKPOINTS.xs });
  const isMobile = useMediaQuery({ maxWidth: BREAKPOINTS.sm });
  const isTablet = useMediaQuery({
    minWidth: BREAKPOINTS.sm + 1,
    maxWidth: BREAKPOINTS.md,
  });
  const isLaptop = useMediaQuery({
    minWidth: BREAKPOINTS.md + 1,
    maxWidth: BREAKPOINTS.lg,
  });
  const isDesktop = useMediaQuery({ minWidth: BREAKPOINTS.lg + 1 });

  // Additional useful combinations
  const isMobileOrTablet = useMediaQuery({ maxWidth: BREAKPOINTS.md });
  const isTabletOrLaptop = useMediaQuery({
    minWidth: BREAKPOINTS.sm + 1,
    maxWidth: BREAKPOINTS.lg,
  });

  return {
    isSmallMobile,
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    isMobileOrTablet,
    isTabletOrLaptop,
    // Current breakpoint name
    device: isSmallMobile
      ? 'xs'
      : isMobile
      ? 'mobile'
      : isTablet
      ? 'tablet'
      : isLaptop
      ? 'laptop'
      : 'desktop',
  } as const;
}

// For backwards compatibility
export function useScreen() {
  const { isMobile, isTablet, isLaptop, isDesktop } = useBreakpoint();
  return { isMobile, isTablet, isLaptop, isDesktop };  
}
