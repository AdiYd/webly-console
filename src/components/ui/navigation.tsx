'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ThemeToggle } from './theme-toggle';
import { useSession } from 'next-auth/react';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

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
  const session = useSession();

  console.log('Session:', session);

  return (
    <div className="navbar min-h-14 bg-base-100/40 backdrop-blur-lg shadow-sm* px-4 border-transparent border-b-zinc-500/30 border-[0.8px]">
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
      <div className="navbar-end gap-1">
        <ThemeToggle />
        <Link href="/auth/signin" className="btn btn-ghost btn-sm">
          Sign In
        </Link>
        <Link href="/auth/signup" className="btn btn-primary btn-sm">
          Sign Up
        </Link>
      </div>
    </div>
  );
}