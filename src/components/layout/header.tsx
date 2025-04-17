'use client';

import React, { useState, useEffect } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrganization } from '@/context/OrganizationContext';
import { useRouter } from 'next/navigation';

const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const headerScrollThreshold = 500; // px
  const { currentOrganization, organizations, switchOrganization } = useOrganization();
  const router = useRouter();

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
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <Navigation />
          <div className="flex-none gap-2">
            {/* Organization Chip */}
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost gap-1 normal-case">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-content">
                  <span className="text-xs font-bold">{currentOrganization.name.charAt(0)}</span>
                </div>
                <span className="hidden md:inline">{currentOrganization.name}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </label>

              <ul
                tabIndex={0}
                className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-300 rounded-box w-52 mt-4"
              >
                <li className="menu-title">
                  <span>Your Organizations</span>
                </li>

                {organizations.map(org => (
                  <li key={org.id}>
                    <a
                      className={org.id === currentOrganization.id ? 'active' : ''}
                      onClick={() => switchOrganization(org.id)}
                    >
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-primary-content">
                        <span className="text-xs">{org.name.charAt(0)}</span>
                      </div>
                      {org.name}
                      {org.id === currentOrganization.id && (
                        <span className="badge badge-sm badge-primary">Active</span>
                      )}
                    </a>
                  </li>
                ))}

                {organizations.length < 4 && (
                  <>
                    <li className="divider"></li>
                    <li>
                      <a onClick={() => router.push('/profile')} className="text-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                        New Organization
                      </a>
                    </li>
                  </>
                )}

                <li className="divider"></li>
                <li>
                  <a onClick={() => router.push('/profile')}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
                      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                      <path d="M12 2v2M12 22v-2M20 12h2M2 12h2" />
                    </svg>
                    Manage Organizations
                  </a>
                </li>
              </ul>
            </div>

            {/* ...existing user profile menu... */}
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
};

export default Header;