import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Github, Mail, ShieldAlert, Sparkles, ArrowUp } from 'lucide-react';

// Sub-components
import ThreeBackground from './components/ThreeBackground';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Contact from './components/Contact';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import SocialShowcase from './components/SocialShowcase';

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved !== 'light'; // Default to premium dark theme
  });

  const [user, setUser] = useState<User | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [activeSection, setActiveSection] = useState('home');
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Apply theme class to HTML node
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Robust route detection for admin console on initialization or hashchange
  useEffect(() => {
    const checkAdminRouting = () => {
      const isPathAdmin = window.location.pathname === '/admin' || window.location.pathname === '/admin/';
      const isHashAdmin = window.location.hash === '#/admin' || window.location.hash === '#admin';
      const isQueryAdmin = new URLSearchParams(window.location.search).get('view') === 'admin';

      if (isPathAdmin || isHashAdmin || isQueryAdmin) {
        setViewMode('admin');
        setActiveSection('admin');
      }
    };

    checkAdminRouting();
    window.addEventListener('hashchange', checkAdminRouting);
    return () => window.removeEventListener('hashchange', checkAdminRouting);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        if (currentUser.email === 'omrishi2580@gmail.com') {
          setIsAdminUser(true);
          try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
              // Self-healing bootstrap logic - writes user details with admin role directly
              await setDoc(userDocRef, {
                email: 'omrishi2580@gmail.com',
                role: 'admin'
              });
              console.log('Successfully bootstrapped database privileges for omrishi2580@gmail.com');
            }
          } catch (err) {
            console.error('Failed to bootstrap role document:', err);
          }
        } else {
          // Verify role for other logged-in accounts
          try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && userDoc.data().role === 'admin') {
              setIsAdminUser(true);
            } else {
              setIsAdminUser(false);
            }
          } catch (err) {
            console.error('Role verification failed:', err);
            setIsAdminUser(false);
          }
        }
      } else {
        setIsAdminUser(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Monitor viewport intersections to highlight the correct active section in navigation
  useEffect(() => {
    if (viewMode !== 'public') return;

    const sections = ['home', 'about', 'skills', 'projects', 'contact'];
    const observers = sections.map((sectionId) => {
      const element = document.getElementById(sectionId);
      if (!element) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(sectionId);
            }
          });
        },
        {
          rootMargin: '-30% 0px -60% 0px', // High precision trigger band
          threshold: 0
        }
      );

      observer.observe(element);
      return { observer, element };
    });

    const handleScrollVisibility = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScrollVisibility, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScrollVisibility);
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.element);
      });
    };
  }, [viewMode]);

  const handleNavigate = (section: string) => {
    if (section === 'admin') {
      setViewMode('admin');
      setActiveSection('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setViewMode('public');
      setActiveSection(section);
      // Wait for React to transition layout back to public view before searching the DOM
      setTimeout(() => {
        const target = document.getElementById(section);
        if (target) {
          const offsetPosition = target.offsetTop - 80; // Offset for navbar header
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 50);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setViewMode('public');
      handleNavigate('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'text-white' : 'text-neutral-900'} relative`}>
      {/* 1. Vanilla Three.js Dynamic Starfield and Wireframe Central Anchor */}
      <ThreeBackground isDarkMode={isDarkMode} />

      {/* 2. Glassmorphic Navigation Menu */}
      <Navbar
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onNavigate={handleNavigate}
        activeSection={activeSection}
        isAdminUser={isAdminUser}
      />

      {/* 3. Main Routing Layer with Entrance Animations */}
      <main className="relative pt-20 z-10">
        <AnimatePresence mode="wait">
          {viewMode === 'admin' ? (
            <motion.div
              key="admin-flow"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              {isAdminUser ? (
                <AdminDashboard isDarkMode={isDarkMode} onLogout={handleLogout} />
              ) : (
                <AdminLogin isDarkMode={isDarkMode} onLoginSuccess={() => setViewMode('admin')} />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="public-flow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              {/* Individual responsive sections */}
              <Hero isDarkMode={isDarkMode} onNavigate={handleNavigate} />
              <About isDarkMode={isDarkMode} />
              <Skills isDarkMode={isDarkMode} />
              <Projects isDarkMode={isDarkMode} />
              <SocialShowcase isDarkMode={isDarkMode} />
              <Contact isDarkMode={isDarkMode} />

              {/* Sophisticated light-theme friendly footer */}
              <footer className={`border-t py-12 px-6 mt-12 text-center transition-colors ${
                isDarkMode ? 'border-neutral-900 bg-neutral-950/40 text-neutral-400' : 'border-neutral-200 bg-white/40 text-neutral-600'
              } backdrop-blur-md relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-[0.01] bg-[radial-gradient(ellipse_at_center,#808080_1px,transparent_1px)] bg-[size:16px_16px]" />
                
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                  <div className="text-left">
                    <span className="text-base font-extrabold tracking-tight">
                      <span className={isDarkMode ? 'text-cyan-400' : 'text-indigo-600'}>Coder</span>
                      <span className={isDarkMode ? 'text-white' : 'text-neutral-900'}>Rishi</span>
                    </span>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Designed and programmed from scratch. All rights reserved &copy; {new Date().getFullYear()}.
                    </p>
                  </div>

                  {/* Social anchors */}
                  <div className="flex items-center space-x-4">
                    <a
                      href="https://github.com/omrishi2580"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2.5 rounded-full border transition-colors ${
                        isDarkMode ? 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white' : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-950'
                      }`}
                      title="GitHub Profile"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                    <a
                      href="mailto:omrishi2580@gmail.com"
                      className={`p-2.5 rounded-full border transition-colors ${
                        isDarkMode ? 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white' : 'bg-neutral-100 border-neutral-200 text-neutral-600 hover:text-neutral-950'
                      }`}
                      title="Direct Mail"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleNavigate('admin')}
                      className={`p-2.5 rounded-full border transition-colors flex items-center space-x-1.5 cursor-pointer ${
                        isDarkMode 
                          ? 'bg-neutral-900/60 border-neutral-800 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/30' 
                          : 'bg-neutral-100 border-neutral-200 text-indigo-600 hover:text-indigo-800 hover:border-indigo-300'
                      }`}
                      title="Access Admin Console & Sign In/Register"
                    >
                      <ShieldAlert className="w-4.5 h-4.5 animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider px-1">Admin Portal</span>
                    </button>
                  </div>
                </div>
              </footer>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Scroll to Top button */}
      <AnimatePresence>
        {showScrollTop && viewMode === 'public' && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`fixed bottom-6 right-6 z-40 p-3 rounded-full border shadow-lg backdrop-blur-md cursor-pointer transition-colors ${
              isDarkMode 
                ? 'bg-neutral-900/90 border-neutral-800 text-cyan-400 hover:text-white' 
                : 'bg-white/90 border-neutral-200 text-indigo-600 hover:text-indigo-800'
            }`}
            title="Scroll to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
