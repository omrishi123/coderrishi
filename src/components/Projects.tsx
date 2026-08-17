import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Project } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Github, ExternalLink, Sparkles, Monitor, RotateCcw, ArrowLeftRight, Check } from 'lucide-react';

interface ProjectsProps {
  isDarkMode: boolean;
}

// Interactive 3D Tilting Card Wrapper
interface TiltingCardProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  key?: string;
}

function TiltingCard({ children, isDarkMode }: TiltingCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within element
    const y = e.clientY - rect.top;  // y position within element
    
    // Convert coordinate to range [-0.5, 0.5]
    const percentX = x / rect.width - 0.5;
    const percentY = y / rect.height - 0.5;

    // Rotate cards in 3D perspective (max 15 degrees tilt)
    setRotateX(percentY * -15);
    setRotateY(percentX * 15);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="perspective-1000 w-full h-[450px]"
    >
      <div
        className="w-full h-full preserve-3d transition-all duration-300 ease-out"
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}

const DEFAULT_PROJECTS: Project[] = [
  {
    title: 'Carbon Genesis',
    description: 'An immersive 3D generative modeler showcasing complex structural assets in real-time. Leverages standard procedural mesh algorithms to form abstract carbon-based matrices dynamically in the browser.',
    techStack: ['Three.js', 'React', 'TypeScript', 'GLSL Shaders'],
    imageUrl: 'abstract-carbon',
    githubLink: 'https://github.com/omrishi2580/carbon-genesis',
    liveLink: 'https://carbon-genesis.dev'
  },
  {
    title: 'Rishi Math Solver',
    description: 'A lightning-fast scientific computations engine that interprets and solves handwritten algebraic and calculus formulas with detailed step-by-step interactive charts and trees.',
    techStack: ['React', 'D3.js', 'WebAssembly', 'TailwindCSS'],
    imageUrl: 'abstract-math',
    githubLink: 'https://github.com/omrishi2580/rishi-math-solver',
    liveLink: 'https://math-solver.rishi.dev'
  },
  {
    title: 'Arcade Engine Ports',
    description: 'Highly optimized, retro arcade assembly-level core engine ports compiled to WebAssembly. Allows running classic ROM engines smoothly at absolute raw speed with modern keyboard/controller mappings.',
    techStack: ['Rust', 'WebAssembly', 'HTML5 Canvas', 'Web Audio API'],
    imageUrl: 'abstract-arcade',
    githubLink: 'https://github.com/omrishi2580/arcade-ports',
    liveLink: 'https://arcade.rishi.dev'
  }
];

export default function Projects({ isDarkMode }: ProjectsProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Tracks which card is flipped to the 3D Live iframe preview side
  const [previewingId, setPreviewingId] = useState<string | null>(null);

  useEffect(() => {
    const projectsCollection = collection(db, 'projects');
    
    const unsubscribe = onSnapshot(
      projectsCollection,
      (snapshot) => {
        const fetched: Project[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as Project);
        });

        if (fetched.length > 0) {
          setProjects(fetched);
        } else {
          setProjects(DEFAULT_PROJECTS);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Failed to fetch projects, falling back to defaults:', error);
        setProjects(DEFAULT_PROJECTS);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const renderCardMockup = (imgUrl: string, title: string) => {
    let gradient = '';
    let iconColor = '';
    
    if (imgUrl === 'abstract-carbon') {
      gradient = 'from-cyan-400 via-indigo-500 to-purple-600';
      iconColor = 'text-cyan-400';
    } else if (imgUrl === 'abstract-math') {
      gradient = 'from-pink-500 via-purple-600 to-cyan-500';
      iconColor = 'text-pink-400';
    } else {
      gradient = 'from-emerald-400 via-teal-500 to-indigo-600';
      iconColor = 'text-emerald-400';
    }

    if (imgUrl && (imgUrl.startsWith('http') || imgUrl.startsWith('/') || imgUrl.startsWith('data:'))) {
      return (
        <div className="relative h-44 w-full overflow-hidden">
          <img 
            src={imgUrl} 
            alt={title} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 to-transparent" />
        </div>
      );
    }

    // High fidelity colorful 3D abstract graphic fallback
    return (
      <div className={`relative h-44 w-full bg-gradient-to-br ${gradient} flex flex-col items-center justify-center overflow-hidden border-b ${
        isDarkMode ? 'border-neutral-800' : 'border-neutral-100'
      }`}>
        {/* Animated matrix overlay */}
        <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:16px_16px]" />
        
        {/* Abstract floating mesh orbits */}
        <motion.div
          animate={{ rotate: [0, 360], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          className="w-32 h-32 rounded-full border border-white/20 flex items-center justify-center border-dashed"
        >
          <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center" />
        </motion.div>

        <div className="absolute z-10 flex flex-col items-center">
          <Sparkles className={`w-9 h-9 mb-1.5 animate-pulse text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]`} />
          <span className="text-[10px] uppercase font-bold tracking-widest text-white/90 drop-shadow-md">
            Interactive Mockup Solid
          </span>
        </div>
      </div>
    );
  };

  return (
    <section id="projects" className="py-24 relative overflow-hidden px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-xs font-black tracking-widest uppercase mb-2 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 bg-clip-text text-transparent"
          >
            Ultimate 3D Showcase
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.1 }}
            className={`text-3xl md:text-6xl font-black tracking-tight leading-none ${
              isDarkMode ? 'text-white' : 'text-neutral-900'
            }`}
          >
            My Interactive Creations
          </motion.h2>
          <p className={`text-xs md:text-sm max-w-xl mx-auto mt-4 font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Click the &quot;Live Site Preview&quot; action below to flip the card in 3D and test the live application immediately inside the card!
          </p>
          <div className="h-1.5 w-28 mx-auto mt-5 rounded-full bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 shadow-[0_0_15px_rgba(0,229,255,0.5)]" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-12 h-12 border-4 border-t-transparent border-pink-500 rounded-full animate-spin" />
            <p className="text-sm text-neutral-500 mt-4 animate-pulse font-bold">Loading WebGL models...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => {
              const projId = project.id || project.title;
              const isPreviewing = previewingId === projId;

              return (
                <TiltingCard key={projId} isDarkMode={isDarkMode}>
                  {/* Card Front & Back flip mechanism */}
                  <div className={`w-full h-full relative preserve-3d transition-all duration-700 ${
                    isPreviewing ? 'rotate-y-180' : ''
                  }`}>
                    
                    {/* CARD FRONT SIDE (Standard view) */}
                    <div className={`absolute inset-0 backface-hidden w-full h-full flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 ${
                      isDarkMode 
                        ? 'bg-neutral-950/80 border-cyan-500/30 hover:border-cyan-400 shadow-[0_10px_35px_-5px_rgba(6,182,212,0.15)]' 
                        : 'bg-white/90 border-indigo-200 hover:border-indigo-500 shadow-[0_10px_35px_-5px_rgba(79,70,229,0.12)]'
                    }`}>
                      {/* Graphics Mockup Header */}
                      <div className="relative group">
                        {renderCardMockup(project.imageUrl, project.title)}
                        
                        {/* Overlay hovering glow chip */}
                        <span className="absolute top-3 right-3 bg-neutral-900/80 text-white font-extrabold text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-md">
                          Interactive
                        </span>
                      </div>

                      {/* Content Area */}
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`text-lg font-black tracking-tight ${
                            isDarkMode ? 'text-white' : 'text-neutral-950'
                          }`}>
                            {project.title}
                          </h3>
                          <div className="flex space-x-1">
                            {project.githubLink && (
                              <a 
                                href={project.githubLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-1.5 rounded-full border transition-all ${
                                  isDarkMode ? 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-neutral-950'
                                }`}
                                title="Repository Code"
                              >
                                <Github className="w-3.5 h-3.5" />
                              </a>
                            )}
                            {project.liveLink && (
                              <a 
                                href={project.liveLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`p-1.5 rounded-full border transition-all ${
                                  isDarkMode ? 'bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:text-white' : 'bg-neutral-50 border-neutral-200 text-neutral-600 hover:text-neutral-950'
                                }`}
                                title="External site"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </div>

                        <p className={`text-xs font-semibold leading-relaxed mb-4 flex-grow line-clamp-3 ${
                          isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
                        }`}>
                          {project.description}
                        </p>

                        {/* Tech stack tags */}
                        <div className="flex flex-wrap gap-1 mb-5">
                          {project.techStack.map((tech) => (
                            <span
                              key={tech}
                              className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-wider ${
                                isDarkMode 
                                  ? 'bg-neutral-900/80 border-neutral-800 text-cyan-400' 
                                  : 'bg-indigo-50/80 border-indigo-100 text-indigo-700'
                              }`}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Flip to Live Site Button! */}
                        <button
                          onClick={() => setPreviewingId(projId)}
                          className={`w-full py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 border transition-all cursor-pointer ${
                            isDarkMode 
                              ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950 border-cyan-400 hover:shadow-[0_0_20px_rgba(0,229,255,0.4)]' 
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.3)]'
                          }`}
                        >
                          <Monitor className="w-3.5 h-3.5" />
                          <span>Show Live Site Preview</span>
                        </button>
                      </div>
                    </div>

                    {/* CARD BACK SIDE (Live Interactive iframe View) */}
                    <div className={`absolute inset-0 backface-hidden rotate-y-180 w-full h-full rounded-2xl border overflow-hidden flex flex-col ${
                      isDarkMode 
                        ? 'bg-neutral-950 border-purple-500/50 shadow-[0_0_35px_rgba(240,46,170,0.25)]' 
                        : 'bg-white border-pink-500/40 shadow-[0_0_35px_rgba(240,46,170,0.15)]'
                    }`}>
                      {/* Browser Window mockup controls */}
                      <div className={`px-4 py-2 flex items-center justify-between border-b ${
                        isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-200'
                      }`}>
                        <div className="flex items-center space-x-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        </div>
                        <span className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 truncate max-w-[120px] tracking-tight">
                          {project.title} Preview
                        </span>
                        
                        {/* Go Back to Front Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewingId(null);
                          }}
                          className={`p-1 rounded-md border transition-colors cursor-pointer ${
                            isDarkMode ? 'hover:bg-neutral-800 border-neutral-800 text-neutral-400 hover:text-white' : 'hover:bg-white border-neutral-300 text-neutral-600 hover:text-neutral-900'
                          }`}
                          title="Back to description"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Actual live iframe preview inside the browser mockup! */}
                      <div className="flex-grow w-full relative bg-white">
                        {project.liveLink ? (
                          <iframe
                            src={project.liveLink}
                            title={`${project.title} Live Preview`}
                            className="w-full h-full border-none pointer-events-auto"
                            sandbox="allow-scripts allow-same-origin allow-forms"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-neutral-900 text-white">
                            <span className="text-xs font-bold text-neutral-400 mb-1">
                              Previewing built-in sandbox mock
                            </span>
                            <span className="text-[10px] text-neutral-500">
                              (Real iFrame is simulated when no URL exists)
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Interactive Bottom Control */}
                      <div className={`p-2 px-3 border-t flex items-center justify-between text-[10px] font-black ${
                        isDarkMode ? 'bg-neutral-900 border-neutral-800 text-neutral-400' : 'bg-neutral-100 border-neutral-200 text-neutral-600'
                      }`}>
                        <span className="flex items-center gap-1 text-emerald-500 font-bold">
                          <Check className="w-3 h-3" />
                          <span>Connected Live</span>
                        </span>
                        
                        <a
                          href={project.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 font-extrabold hover:underline ${
                            isDarkMode ? 'text-cyan-400' : 'text-indigo-600'
                          }`}
                        >
                          <span>Open in Tab</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>

                  </div>
                </TiltingCard>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
