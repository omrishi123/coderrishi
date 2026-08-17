import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { AboutDetails } from '../types';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Mail, 
  ArrowDown, 
  Sparkles,
  Quote
} from 'lucide-react';

interface HeroProps {
  isDarkMode: boolean;
  onNavigate: (section: string) => void;
}

export default function Hero({ isDarkMode, onNavigate }: HeroProps) {
  const [aboutDetails, setAboutDetails] = useState<AboutDetails | null>(null);

  // Sync profile details from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'about'), (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        setAboutDetails({ id: docSnap.id, ...docSnap.data() } as AboutDetails);
      }
    }, (error) => {
      console.error('Failed to sync about details inside Hero:', error);
    });

    return () => unsub();
  }, []);

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 md:px-8 py-20 overflow-hidden"
    >
      {/* Cinematic neon backdrop overlays */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600/10 dark:bg-purple-900/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[15%] right-[10%] w-[350px] h-[350px] bg-cyan-600/10 dark:bg-cyan-900/10 rounded-full blur-[110px] pointer-events-none" />

      {/* Social Icons Ribbon - Left Side (Desktop Only) */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center space-y-6">
        <a 
          href="https://github.com/omrishi2580" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`p-2.5 rounded-full border transition-all duration-300 hover:scale-110 ${
            isDarkMode 
              ? 'bg-neutral-950/80 border-neutral-800/80 text-neutral-400 hover:text-cyan-400 hover:border-cyan-500/40' 
              : 'bg-white/80 border-neutral-200 text-neutral-500 hover:text-indigo-600 hover:border-indigo-300'
          }`}
          title="GitHub"
        >
          <Github className="w-4.5 h-4.5" />
        </a>
        <a 
          href="https://linkedin.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`p-2.5 rounded-full border transition-all duration-300 hover:scale-110 ${
            isDarkMode 
              ? 'bg-neutral-950/80 border-neutral-800/80 text-neutral-400 hover:text-cyan-400 hover:border-cyan-500/40' 
              : 'bg-white/80 border-neutral-200 text-neutral-500 hover:text-indigo-600 hover:border-indigo-300'
          }`}
          title="LinkedIn"
        >
          <Linkedin className="w-4.5 h-4.5" />
        </a>
        <a 
          href="https://twitter.com" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`p-2.5 rounded-full border transition-all duration-300 hover:scale-110 ${
            isDarkMode 
              ? 'bg-neutral-950/80 border-neutral-800/80 text-neutral-400 hover:text-cyan-400 hover:border-cyan-500/40' 
              : 'bg-white/80 border-neutral-200 text-neutral-500 hover:text-indigo-600 hover:border-indigo-300'
          }`}
          title="Twitter"
        >
          <Twitter className="w-4.5 h-4.5" />
        </a>
        <a 
          href="mailto:omrishi2580@gmail.com" 
          className={`p-2.5 rounded-full border transition-all duration-300 hover:scale-110 ${
            isDarkMode 
              ? 'bg-neutral-950/80 border-neutral-800/80 text-neutral-400 hover:text-cyan-400 hover:border-cyan-500/40' 
              : 'bg-white/80 border-neutral-200 text-neutral-500 hover:text-indigo-600 hover:border-indigo-300'
          }`}
          title="Email"
        >
          <Mail className="w-4.5 h-4.5" />
        </a>
        <div className="w-[1px] h-20 bg-gradient-to-b from-neutral-400 to-transparent dark:from-neutral-800" />
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto w-full relative z-10 flex flex-col items-center justify-center space-y-12">
        
        {/* Row Containing Names, Logo, & Specialty Label (Forced side-by-side on md screens and wider) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-0 w-full items-center justify-center">
          
          {/* 1. LEFT COLUMN: Symmetrical Greeting Block (Aligned cleanly to right/side of logo) */}
          <div className="md:col-span-4 text-center md:text-right flex flex-col justify-center items-center md:items-end h-full order-1 md:pr-6 lg:pr-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-3 flex flex-col items-center md:items-end"
            >
              <p className={`text-base sm:text-lg font-bold tracking-tight ${isDarkMode ? 'text-purple-400' : 'text-indigo-600'}`}>
                Hello! I&apos;m
              </p>
              
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95] ${
                isDarkMode ? 'text-white' : 'text-neutral-950'
              }`}>
                OM RISHI <br />
                KUMAR
              </h1>

              <div className="inline-flex items-center space-x-1.5 pt-1">
                <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span className={`text-xs sm:text-sm uppercase font-extrabold tracking-widest ${
                  isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
                }`}>
                  CODER RISHI
                </span>
              </div>
            </motion.div>
          </div>

          {/* 2. MIDDLE COLUMN: Center Core Avatar with Glowing Halos */}
          <div className="md:col-span-4 flex justify-center items-center relative order-2 my-6 md:my-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              {/* External decorative spinning dash bounds */}
              <div className="absolute inset-[-18px] rounded-full border border-dashed border-purple-500/30 animate-spin-slow pointer-events-none" />
              <div className="absolute inset-[-6px] rounded-full bg-purple-500/15 dark:bg-purple-600/20 blur-2xl animate-pulse pointer-events-none" />

              {/* Glowing bouncing violet element mimicking image layout detail */}
              <div className="absolute -top-3 -right-5 w-6 h-6 rounded-full bg-purple-400/90 dark:bg-purple-300/95 shadow-[0_0_15px_rgba(168,85,247,0.8)] animate-bounce" />

              {/* Visual Frame Wrapper */}
              <div className={`w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-full p-[3px] bg-gradient-to-tr ${
                isDarkMode 
                  ? 'from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_40px_rgba(168,85,247,0.35)]' 
                  : 'from-indigo-500 via-purple-500 to-cyan-500 shadow-[0_0_30px_rgba(99,102,241,0.22)]'
              } overflow-hidden`}>
                
                <div className={`w-full h-full rounded-full flex flex-col items-center justify-center relative overflow-hidden ${
                  isDarkMode ? 'bg-neutral-950' : 'bg-neutral-50'
                }`}>
                  {aboutDetails?.profilePhotoBase64 ? (
                    <img 
                      src={aboutDetails.profilePhotoBase64} 
                      alt="Om Rishi Kumar Logo" 
                      className="w-full h-full object-cover rounded-full"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className={`text-4xl sm:text-5xl font-black tracking-tighter ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>
                        OM
                      </span>
                    </div>
                  )}
                  
                  {/* Internal ambient twilight layer */}
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent pointer-events-none" />
                </div>

              </div>
            </motion.div>
          </div>

          {/* 3. RIGHT COLUMN: Specialty Role & Mission Statement (Aligned cleanly to left/side of logo) */}
          <div className="md:col-span-4 text-center md:text-left flex flex-col justify-center items-center md:items-start h-full order-3 md:pl-6 lg:pl-10">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              className="space-y-3 flex flex-col items-center md:items-start"
            >
              <p className={`text-base sm:text-lg font-bold tracking-tight ${isDarkMode ? 'text-cyan-400' : 'text-indigo-600'}`}>
                A Creative
              </p>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95]">
                <span className="bg-gradient-to-r from-purple-500 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                  DEVELOPER
                </span>
                <br />
                <span className={isDarkMode ? 'text-white' : 'text-neutral-950'}>
                  QUEST
                </span>
              </h2>

              <p className={`text-xs sm:text-sm uppercase font-extrabold tracking-wider ${
                isDarkMode ? 'text-neutral-400' : 'text-neutral-500'
              }`}>
                Building premium digital products
              </p>
            </motion.div>
          </div>

        </div>

        {/* BOTTOM CONTAINER: Aligned perfectly BELOW the logo-middle column */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.8 }}
          className="flex flex-col items-center space-y-6 w-full max-w-lg text-center px-4"
        >
          {/* Centered quote card directly beneath the logo */}
          <div className={`p-4 sm:p-5 rounded-2xl border text-xs sm:text-sm leading-relaxed text-left relative ${
            isDarkMode 
              ? 'bg-neutral-900/70 border-neutral-800 text-neutral-300' 
              : 'bg-neutral-50 border-neutral-150 text-neutral-600 shadow-sm'
          }`}>
            <Quote className="w-4 h-4 text-purple-400 mb-1" />
            <p className="font-semibold italic">
              &quot;Writing elegant, highly-optimized code is a quest. I turn complex backend operations and interactive designs into seamless software realities.&quot;
            </p>
          </div>

          {/* Action CTAs aligned right below the quote */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <button
              onClick={() => onNavigate('about')}
              className={`px-6 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center space-x-1.5 cursor-pointer border ${
                isDarkMode 
                  ? 'bg-neutral-950 border-neutral-800 text-white hover:bg-neutral-900' 
                  : 'bg-white border-neutral-200 text-neutral-800 hover:bg-neutral-50'
              }`}
            >
              <span>Explore Me</span>
              <ArrowDown className="w-3.5 h-3.5 animate-bounce text-purple-400" />
            </button>

            <button
              onClick={() => onNavigate('contact')}
              className={`px-6 py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 cursor-pointer shadow-md ${
                isDarkMode 
                  ? 'bg-purple-600 hover:bg-purple-500 text-white hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-[0_0_15px_rgba(79,70,229,0.2)]'
              }`}
            >
              Get In Touch
            </button>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
