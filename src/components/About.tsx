import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { AboutDetails } from '../types';
import { 
  Code2, 
  Layers, 
  Smartphone, 
  Cpu, 
  Award, 
  UserCheck, 
  Globe,
  Zap,
  Terminal,
  Compass,
  ArrowUpRight,
  BookOpen,
  Milestone,
  Sparkles,
  Command,
  Heart
} from 'lucide-react';

interface AboutProps {
  isDarkMode: boolean;
}

// Reusable 3D Pinch Up transition preset for imported modules
export const PINCH_UP_TRANSITION = {
  initial: { 
    opacity: 0, 
    rotateY: -22, 
    rotateX: 12, 
    scale: 0.8, 
    x: -50, 
    y: 50, 
    transformOrigin: 'bottom left' 
  },
  whileInView: { 
    opacity: 1, 
    rotateY: 0, 
    rotateX: 0, 
    scale: 1, 
    x: 0, 
    y: 0 
  },
  transition: { 
    type: 'spring' as const, 
    stiffness: 80, 
    damping: 15 
  },
  viewport: { 
    once: true, 
    margin: '-100px' 
  }
};

const DOMAINS = [
  {
    icon: Code2,
    title: 'Frontend Development',
    description: 'Developing responsive, interactive, and modern single-page applications with highly optimized render states and polished visual layouts.',
    techs: ['React', 'TypeScript', 'TailwindCSS', 'Next.js'],
    glow: 'hover:shadow-[0_0_35px_rgba(6,182,212,0.4)] border-cyan-500/20'
  },
  {
    icon: Layers,
    title: 'Full-Stack Integration',
    description: 'Architecting scalable server logic, RESTful APIs, and robust persistent databases to synchronize offline/online data seamlessly.',
    techs: ['Node.js', 'Express', 'Firebase', 'PostgreSQL'],
    glow: 'hover:shadow-[0_0_35px_rgba(168,85,247,0.4)] border-purple-500/20'
  },
  {
    icon: Smartphone,
    title: 'Android Development',
    description: 'Engineering native mobile experiences focusing on optimal performance, intuitive material layouts, and asynchronous local data caching.',
    techs: ['Kotlin', 'Jetpack Compose', 'Coroutines', 'SQLite'],
    glow: 'hover:shadow-[0_0_35px_rgba(236,72,153,0.4)] border-pink-500/20'
  },
  {
    icon: Cpu,
    title: '3D Web Experiences',
    description: 'Designing fully interactive three-dimensional spaces, particles, shaders, and complex models rendering at 60fps directly in the browser.',
    techs: ['Three.js', 'WebGL', 'GLSL Shaders', 'GSAP'],
    glow: 'hover:shadow-[0_0_35px_rgba(16,185,129,0.4)] border-emerald-500/20'
  },
];

// Interactive mock shell command lines
const SHELL_COMMANDS = [
  { command: 'whoami', output: 'omrishi / software-craftsman' },
  { command: 'rishi --skills', output: '["TypeScript", "React/Next.js", "Node.js", "Kotlin/Android", "Firebase", "SQL"]' },
  { command: 'rishi --hobbies', output: '["UI/UX Design", "Gamer", "Cybersecurity Enthusiast", "Open-Source Contributor"]' },
  { command: 'rishi --motto', output: '"Transform complex backend puzzles into elegant fluid frontend user realities."' }
];

export default function About({ isDarkMode }: AboutProps) {
  const [aboutDetails, setAboutDetails] = useState<AboutDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'bio' | 'terminal' | 'expertise'>('bio');
  const [selectedShellLine, setSelectedShellLine] = useState<number | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  // Sync profile data from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'about'), (snapshot) => {
      if (!snapshot.empty) {
        const docSnap = snapshot.docs[0];
        setAboutDetails({ id: docSnap.id, ...docSnap.data() } as AboutDetails);
      }
    }, (error) => {
      console.error('Failed to sync about details inside About:', error);
    });

    return () => unsub();
  }, []);

  return (
    <section id="about" className="py-28 relative overflow-hidden px-4 sm:px-6 md:px-8 transition-colors duration-300">
      
      {/* Visual Separation Boundary */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-neutral-300 dark:via-neutral-800 to-transparent" />

      {/* Futuristic Background Accents */}
      <div className="absolute top-[40%] right-[-10%] w-72 h-72 bg-pink-500/5 dark:bg-pink-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-80 h-80 bg-cyan-500/5 dark:bg-cyan-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-20">
        
        {/* Core Section Header with Elegant typography pairings */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full border border-purple-500/10 dark:bg-purple-950/20 bg-purple-50">
            <Zap className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
            <span className={`text-[10px] uppercase font-black tracking-widest ${isDarkMode ? 'text-neutral-300' : 'text-neutral-600'}`}>
              Discover My Story
            </span>
          </div>

          <h3 className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter ${
            isDarkMode ? 'text-white' : 'text-neutral-950'
          }`}>
            ABOUT <span className="font-serif italic font-light text-purple-400 dark:text-purple-300">me</span>
          </h3>

          <p className={`max-w-xl text-xs sm:text-sm leading-relaxed ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
            Bridging pixel-perfect visual designs with bulletproof backend logic. Hover, click, and interact to explore my digital DNA.
          </p>

          {/* Symmetrical Interactive Tabs */}
          <div className="flex p-1.5 rounded-2xl border max-w-md w-full bg-neutral-100/50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800/80 mt-6 relative z-10">
            <button
              onClick={() => setActiveTab('bio')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                activeTab === 'bio'
                  ? 'bg-white dark:bg-neutral-800 text-purple-500 shadow-md scale-[1.02]'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Biography
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                activeTab === 'terminal'
                  ? 'bg-white dark:bg-neutral-800 text-purple-500 shadow-md scale-[1.02]'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Developer Console
            </button>
            <button
              onClick={() => setActiveTab('expertise')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                activeTab === 'expertise'
                  ? 'bg-white dark:bg-neutral-800 text-purple-500 shadow-md scale-[1.02]'
                  : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
              }`}
            >
              Core Expertise
            </button>
          </div>
        </div>

        {/* INTERACTIVE TAB WINDOWS WITH ANIMATE PRESENCE */}
        <div className="min-h-[420px] relative">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: BIOGRAPHY STORY */}
            {activeTab === 'bio' && (
              <motion.div
                key="bio-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
              >
                {/* PROFILE BRANDING CARD (Left) */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div className={`w-full max-w-sm rounded-3xl border p-6 relative overflow-hidden transition-all duration-300 ${
                    isDarkMode 
                      ? 'bg-neutral-950/80 border-neutral-800 shadow-2xl hover:border-purple-500/30' 
                      : 'bg-white border-neutral-200 shadow-lg hover:border-indigo-400/30'
                  }`}>
                    {/* Glowing abstract background bubble */}
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

                    {/* Profile Avatar Frame */}
                    <div className={`w-28 h-28 rounded-2xl mx-auto mb-6 p-[2px] bg-gradient-to-tr ${
                      isDarkMode ? 'from-cyan-400 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'from-indigo-500 via-purple-500 to-cyan-500'
                    } overflow-hidden shadow-md`}>
                      <div className={`w-full h-full rounded-2xl overflow-hidden relative ${
                        isDarkMode ? 'bg-neutral-900' : 'bg-neutral-100'
                      }`}>
                        {aboutDetails?.profilePhotoBase64 ? (
                          <img 
                            src={aboutDetails.profilePhotoBase64} 
                            alt="Om Rishi Biography" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-black text-2xl text-neutral-400">
                            RISHI
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent pointer-events-none" />
                      </div>
                    </div>

                    {/* Meta Status Badges */}
                    <div className="space-y-4 text-center">
                      <div>
                        <h4 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                          {aboutDetails?.brandName || 'Om Rishi Kumar'}
                        </h4>
                        <p className={`text-[10px] font-black tracking-widest uppercase ${isDarkMode ? 'text-cyan-400' : 'text-indigo-600'}`}>
                          Full-Stack Software Engineer
                        </p>
                      </div>

                      <div className="h-[1px] bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent" />

                      <div className="flex flex-col gap-2 text-left">
                        <div className={`px-4 py-2.5 rounded-xl border text-[11px] font-bold flex items-center space-x-2.5 transition-colors duration-300 ${
                          isDarkMode ? 'bg-neutral-900/40 border-neutral-800/80 hover:border-purple-500/20 text-neutral-300' : 'bg-neutral-50 border-neutral-150 text-neutral-600'
                        }`}>
                          <UserCheck className="w-4 h-4 text-emerald-400 shrink-0 animate-pulse" />
                          <span>Role: Lead Architecture Engineer</span>
                        </div>
                        
                        <div className={`px-4 py-2.5 rounded-xl border text-[11px] font-bold flex items-center space-x-2.5 transition-colors duration-300 ${
                          isDarkMode ? 'bg-neutral-900/40 border-neutral-800/80 hover:border-purple-500/20 text-neutral-300' : 'bg-neutral-50 border-neutral-150 text-neutral-600'
                        }`}>
                          <Award className="w-4 h-4 text-cyan-400 shrink-0" />
                          <span>Focus: Multi-Platform UI Systems</span>
                        </div>

                        <div className={`px-4 py-2.5 rounded-xl border text-[11px] font-bold flex items-center space-x-2.5 transition-colors duration-300 ${
                          isDarkMode ? 'bg-neutral-900/40 border-neutral-800/80 hover:border-purple-500/20 text-neutral-300' : 'bg-neutral-50 border-neutral-150 text-neutral-600'
                        }`}>
                          <Globe className="w-4 h-4 text-indigo-400 shrink-0 animate-spin-slow" />
                          <span>Status: Open for Global Relocation</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* BIOGRAPHY NARRATIVE (Right) */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="space-y-4">
                    <h4 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white flex items-center space-x-2">
                      <BookOpen className="w-5 h-5 text-purple-400" />
                      <span>Crafting Fluid Engineering Realities</span>
                    </h4>
                    
                    <p className={`text-base leading-relaxed font-semibold ${
                      isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
                    }`}>
                      {aboutDetails?.bioText || "I design, program, and maintain modern web portals and mobile software from scratch. I strive to push the visual limits of interactive frameworks by combining performance interfaces with 3D WebGL setups."}
                    </p>

                    <p className={`text-sm leading-relaxed ${
                      isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
                    }`}>
                      {aboutDetails?.additionalBio || "Backed by full-stack server integration expertise, database security rules, and clean native Android layout practices, I engineer software products that are exceptionally fast, modern, and engaging."}
                    </p>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black tracking-wider text-purple-400">01. Creative Mindset</span>
                      <p className={`text-xs ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        Treating every single layout, spacing, and micro-interaction like structural art.
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400">02. Solid Architecture</span>
                      <p className={`text-xs ${isDarkMode ? 'text-neutral-300' : 'text-neutral-700'}`}>
                        Ensuring low overhead, lightning-fast rendering speeds, and persistent databases.
                      </p>
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

            {/* TAB 2: INTERACTIVE DEVELOPER CONSOLE */}
            {activeTab === 'terminal' && (
              <motion.div
                key="terminal-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="max-w-3xl mx-auto w-full rounded-2xl border border-neutral-800 bg-neutral-950 p-5 font-mono text-xs text-neutral-300 shadow-2xl relative overflow-hidden"
              >
                {/* Red, Yellow, Green Window Controls */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-900">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-600 cursor-pointer" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-600 cursor-pointer" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-600 cursor-pointer" />
                  </div>
                  <span className="text-[10px] text-neutral-600 font-extrabold uppercase tracking-widest flex items-center gap-1">
                    <Terminal className="w-3 h-3" />
                    coder-rishi-interactive-v1.4.sh
                  </span>
                </div>

                <p className="text-neutral-500 mb-4 italic">
                  // Click any command block below to run it interactively in the prompt...
                </p>

                {/* Interactive commands */}
                <div className="space-y-3.5">
                  {SHELL_COMMANDS.map((item, idx) => (
                    <div 
                      key={item.command}
                      onClick={() => setSelectedShellLine(selectedShellLine === idx ? null : idx)}
                      className={`p-3 rounded-xl border border-neutral-900/60 transition-all duration-300 cursor-pointer ${
                        selectedShellLine === idx 
                          ? 'bg-purple-950/20 border-purple-500/30 text-purple-300 shadow-inner' 
                          : 'hover:bg-neutral-900/40 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-purple-400 font-bold">~</span>
                          <span className="text-emerald-400 font-bold">omrishi-portfolio</span>
                          <span className="text-neutral-500 font-bold">$</span>
                          <span className="font-extrabold text-neutral-200">{item.command}</span>
                        </div>
                        <span className={`text-[9px] uppercase px-2 py-0.5 rounded-md ${
                          selectedShellLine === idx ? 'bg-purple-500/20 text-purple-400' : 'bg-neutral-900 text-neutral-600'
                        }`}>
                          {selectedShellLine === idx ? 'Active' : 'Click to run'}
                        </span>
                      </div>

                      <AnimatePresence>
                        {selectedShellLine === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="mt-2.5 pt-2.5 border-t border-neutral-900/60 overflow-hidden text-neutral-400 flex flex-col space-y-1"
                          >
                            <span className="text-neutral-500 text-[10px] font-bold">OUTPUT:</span>
                            <span className="text-cyan-400 leading-relaxed break-words">{item.output}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                {/* Blinking Prompt Line */}
                <div className="flex items-center space-x-2 mt-6 text-neutral-500">
                  <span className="text-purple-400">~</span>
                  <span className="text-emerald-400">omrishi-portfolio</span>
                  <span>$</span>
                  <motion.div 
                    animate={{ opacity: [1, 0, 1] }} 
                    transition={{ repeat: Infinity, duration: 1 }} 
                    className="w-2 h-4 bg-cyan-400" 
                  />
                </div>
              </motion.div>
            )}

            {/* TAB 3: CORE EXPERTISE GRID */}
            {activeTab === 'expertise' && (
              <motion.div
                key="expertise-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.4 }}
                className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {DOMAINS.map((domain) => {
                  const IconComponent = domain.icon;
                  return (
                    <motion.div
                      key={domain.title}
                      whileHover={{ y: -8, scale: 1.02 }}
                      className={`p-6 rounded-3xl border backdrop-blur-md transition-all duration-300 relative overflow-hidden ${
                        isDarkMode 
                          ? 'bg-neutral-950/70 border-cyan-500/10 hover:bg-neutral-900/40' 
                          : 'bg-white border-indigo-200 hover:bg-neutral-50/50'
                      } ${domain.glow}`}
                    >
                      <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full pointer-events-none" />

                      <div className={`p-3 rounded-2xl w-fit mb-4 border ${
                        isDarkMode ? 'bg-neutral-900 border-neutral-800 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-neutral-100 border-neutral-200 text-indigo-600'
                      }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>

                      <h4 className={`text-base font-black mb-2 tracking-tight ${
                        isDarkMode ? 'text-white' : 'text-neutral-900'
                      }`}>
                        {domain.title}
                      </h4>

                      <p className={`text-xs leading-relaxed mb-5 font-semibold ${
                        isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
                      }`}>
                        {domain.description}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {domain.techs.map(t => (
                          <span
                            key={t}
                            className={`text-[9px] font-black px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                              isDarkMode 
                                ? 'bg-neutral-900 border-neutral-800 text-neutral-400' 
                                : 'bg-indigo-50 border-indigo-100 text-indigo-700'
                            }`}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* METRICS & PHILOSOPHY RIBBON */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
              <Milestone className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>3+ Years Mastery</p>
              <p className={`text-xs leading-normal mt-0.5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Of production deployment experience in modern environments.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
              <Sparkles className="w-5 h-5 text-cyan-400 animate-spin-slow" />
            </div>
            <div>
              <p className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>Fluid Aesthetics</p>
              <p className={`text-xs leading-normal mt-0.5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Pairing meticulous structural alignment rules with spring dynamics.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'}`}>
              <Command className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-neutral-900'}`}>15+ Completed Apps</p>
              <p className={`text-xs leading-normal mt-0.5 ${isDarkMode ? 'text-neutral-400' : 'text-neutral-500'}`}>
                Crafted, scaled, and managed with strict backend security protocols.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
