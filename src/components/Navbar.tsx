import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Sun, Moon, Shield } from 'lucide-react';

interface NavbarProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onNavigate: (section: string) => void;
  activeSection: string;
  isAdminUser: boolean;
}

const NAV_LINKS = [
  { label: 'Home', target: 'home' },
  { label: 'About', target: 'about' },
  { label: 'Skills', target: 'skills' },
  { label: 'Projects', target: 'projects' },
  { label: 'Contact', target: 'contact' },
];

export default function Navbar({ isDarkMode, toggleDarkMode, onNavigate, activeSection, isAdminUser }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'py-3 backdrop-blur-md border-b bg-opacity-70 ' + (isDarkMode ? 'border-neutral-800 bg-neutral-950/70' : 'border-neutral-200 bg-white/70')
          : 'py-5 bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center space-x-2 focus:outline-none group"
        >
          <span className="text-xl font-bold tracking-tight">
            <span className={isDarkMode ? 'text-cyan-400' : 'text-indigo-600'}>Coder</span>
            <span className={isDarkMode ? 'text-white' : 'text-neutral-900'}>Rishi</span>
          </span>
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
        </button>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-1">
          {NAV_LINKS.map((link) => {
            const isActive = activeSection === link.target;
            return (
              <button
                key={link.target}
                onClick={() => onNavigate(link.target)}
                className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? isDarkMode ? 'text-white' : 'text-indigo-600 font-semibold'
                    : isDarkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full ${
                      isDarkMode ? 'bg-cyan-400' : 'bg-indigo-600'
                    }`}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {link.label}
              </button>
            );
          })}

          <div className="h-4 w-[1px] bg-neutral-300 dark:bg-neutral-800 mx-4" />

          {/* Admin panel link */}
          {isAdminUser && (
            <button
              onClick={() => onNavigate('admin')}
              className={`p-2 rounded-full transition-colors ${
                activeSection === 'admin'
                  ? isDarkMode ? 'bg-neutral-800 text-cyan-400' : 'bg-neutral-100 text-indigo-600'
                  : isDarkMode ? 'hover:bg-neutral-900 text-neutral-400 hover:text-white' : 'hover:bg-neutral-100 text-neutral-600 hover:text-neutral-900'
              }`}
              title="Admin Console"
            >
              <Shield className="w-4 h-4" />
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors ml-2 ${
              isDarkMode ? 'hover:bg-neutral-900 text-yellow-400' : 'hover:bg-neutral-100 text-neutral-700'
            }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Nav Button */}
        <div className="flex items-center md:hidden space-x-2">
          {/* Admin panel link for Mobile */}
          {isAdminUser && (
            <button
              onClick={() => {
                onNavigate('admin');
                setIsOpen(false);
              }}
              className={`p-2 rounded-full transition-colors ${
                activeSection === 'admin'
                  ? isDarkMode ? 'text-cyan-400' : 'text-indigo-600'
                  : isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
              }`}
            >
              <Shield className="w-5 h-5" />
            </button>
          )}

          {/* Theme Toggle for Mobile */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors ${
              isDarkMode ? 'text-yellow-400' : 'text-neutral-700'
            }`}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'text-white hover:bg-neutral-900' : 'text-neutral-900 hover:bg-neutral-100'
            }`}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`md:hidden overflow-hidden border-b ${
              isDarkMode ? 'bg-neutral-950/95 border-neutral-800' : 'bg-white/95 border-neutral-200'
            } backdrop-blur-md`}
          >
            <div className="px-6 py-4 flex flex-col space-y-3">
              {NAV_LINKS.map((link) => {
                const isActive = activeSection === link.target;
                return (
                  <button
                    key={link.target}
                    onClick={() => {
                      onNavigate(link.target);
                      setIsOpen(false);
                    }}
                    className={`py-2 px-4 rounded-lg text-left text-sm font-semibold transition-all ${
                      isActive
                        ? isDarkMode ? 'bg-neutral-900 text-cyan-400' : 'bg-indigo-50 text-indigo-600'
                        : isDarkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
