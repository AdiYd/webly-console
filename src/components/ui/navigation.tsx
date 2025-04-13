'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { ThemeToggle } from './theme-toggle';
import { useSession, signOut } from 'next-auth/react';
import { Icon } from '@iconify/react';
import { useBreakpoint } from '@/hooks/use-screen';
import { motion, AnimatePresence } from 'framer-motion';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const sessionExample = {
  status: 'authenticated',
  data: {
    user: {
      name: 'John Doe',
      email: 'demo@example.com',
      role: 'Trial',
      image: 'https://i.pravatar.cc/150?img=3',
      rememberMe: false,
    },
  },
};

function NavLink({ href, children, className }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`btn btn-ghost btn-sm ${isActive ? 'btn-active' : ''} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const session = useSession();
  const { isDesktop } = useBreakpoint();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  let authElement = null;
  let avatar = null;

  if (session.status === 'authenticated' && session.data?.user?.image) {
    // Use sessionExample data for demonstration
    const userData = session.data.user;

    avatar = (
      <div
        className="avatar online cursor-pointer"
        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
      >
        <div className="mask mask-squircle w-8 ring ring-offset-2 ring-primary ring-offset-base-100 hover:opacity-85">
          <img src={userData.image} alt={userData.name || 'User profile'} />
        </div>
      </div>
    );

    // User menu content
    const userMenuContent = (
      <>
        <div className="p-4 border-b bg-base-100 border-base-200">
          <div className="flex items-center gap-6">
            <div className="avatar">
              <div className="w-12 mask mask-squircle">
                <img src={userData.image} alt={userData.name} />
              </div>
            </div>
            <div>
              <h3 className="font-bold text-lg">{userData.name}</h3>
              <p className="text-sm opacity-70">{userData.email}</p>
              <div className="badge badge-primary mt-1 badge-md">{userData.role}</div>
            </div>
          </div>
        </div>

        <ul className="menu bg-base-100 p-4 gap-2">
          <li>
            <Link
              href="/profile"
              className="flex items-center gap-2"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <Icon icon="carbon:user-avatar" />
              Profile
            </Link>
          </li>
          {/* <li>
            <Link
              href="/settings"
              className="flex items-center gap-2"
              onClick={() => setIsUserMenuOpen(false)}
            >
              <Icon icon="carbon:settings" />
              Settings
            </Link>
          </li> */}
          <li className="">
            <button onClick={handleLogout} className="flex items-center gap-2 text-error">
              <Icon icon="carbon:logout" />
              Logout
            </button>
          </li>
        </ul>
      </>
    );

    authElement = (
      <div className="navbar-end gap-4 -right-4 relative" ref={userMenuRef}>
        <ThemeToggle />

        {avatar}

        <AnimatePresence>
          {isUserMenuOpen ? (
            isDesktop ? (
              // Drawer for desktop/laptop with animation
              <div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                ></motion.div>
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                  className="fixed inset-y-14 right-0 w-80 bg-base-100 shadow-lg z-50"
                >
                  <div className="flex justify-between bg-base-100 items-center p-4 border-b border-base-200">
                    <h2 className="font-bold">Account</h2>
                    <button
                      className="btn btn-circle btn-sm btn-ghost"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Icon icon="carbon:close" width={20} />
                    </button>
                  </div>
                  {userMenuContent}
                </motion.div>
              </div>
            ) : (
              // Dropdown for mobile with animation
              <div className="dropdown dropdown-end dropdown-open">
                <motion.ul
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30,
                  }}
                  className="dropdown-content z-[2] menu shadow bg-base-100 rounded-box w-72 mt-4"
                >
                  {userMenuContent}
                </motion.ul>
              </div>
            )
          ) : (
            <div></div>
          )}
        </AnimatePresence>
      </div>
    );
  } else if (session.status === 'loading') {
    authElement = (
      <div className="navbar-end">
        <span className="loading loading-spinner loading-sm"></span>
      </div>
    );
  } else {
    authElement = (
      <div className="navbar-end gap-1">
        <ThemeToggle />
        <Link href="/auth/signin" className="btn btn-ghost btn-sm">
          Sign In
        </Link>
        <Link href="/auth/signup" className="btn btn-primary btn-sm">
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <div className="navbar min-h-14 bg-base-100/40 backdrop-blur-lg px-4 border-transparent border-b-zinc-500/30 border-[0.8px] relative z-10">
      <div className="navbar-start">
        <div className="dropdown">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-sm lg:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          {isMenuOpen && (
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <Link href="/">Home</Link>
              </li>
              <li className="mt-1">
                <Link href="/chat">AI Chat</Link>
              </li>
              <li className="mt-1">
                <Link href="/exercises">Math Exercises</Link>
              </li>
            </ul>
          )}
        </div>
        <Link href="/" className="text-lg px-2">
          Webly AI
        </Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="flex px-1 gap-2">
          <li>
            <NavLink href="/">Home</NavLink>
          </li>
          <li>
            <NavLink href="/chat">AI Chat</NavLink>
          </li>
          <li>
            <NavLink href="/exercises">Math Exercises</NavLink>
          </li>
        </ul>
      </div>
      {authElement}
    </div>
  );
}