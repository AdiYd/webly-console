import React from 'react';
import { Icon } from '@iconify/react';

const Footer = () => {
  return (
    <footer className="footer px-4 shadow-sm border-transparent border-t-zinc-500/20 border-[0.8px] bg-base-100/80 backdrop-blur-lg z-10 text-base-content p-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center max-sm:items-stretch">
        <div className="flex items-center space-x-4">
          <Icon icon="mdi:web" className="w-6 h-6 text-primary" />
          <span className="text-lg font-semibold">Webly AI</span>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-4">
          <a href="#" className="link link-hover text-primary">
            Privacy Policy
          </a>
          <a href="#" className="link link-hover text-primary">
            Terms of Service
          </a>
          <a href="#" className="link link-hover text-primary">
            Contact Us
          </a>
        </div>
        <div className="mt-4 md:mt-0 text-sm">
          © {new Date().getFullYear()} Webly AI. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;