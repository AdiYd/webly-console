'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const headerScrollThreshold = 500; // px

  const handleScroll = () => {
    const currentScrollY = window.scrollY;
    
    // Show header when:
    // 1. User scrolls up
    // 2. User is at the top of the page
    // 3. User has scrolled past the threshold and is now scrolling up
    if (
      currentScrollY < lastScrollY || 
      currentScrollY < headerScrollThreshold || 
      (currentScrollY < headerScrollThreshold && lastScrollY > headerScrollThreshold)
    ) {
      setIsVisible(true);
    } 
    // Hide header when:
    // User has scrolled past threshold and is scrolling down
    else if (currentScrollY > lastScrollY && currentScrollY > headerScrollThreshold) {
      setIsVisible(false);
    }
    
    setLastScrollY(currentScrollY);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.header
          className="fixed top-0 left-0 right-0 z-30 w-full"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Navigation />
        </motion.header>
      )}
    </AnimatePresence>
  );
};

export default Header;