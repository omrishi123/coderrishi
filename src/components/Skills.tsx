import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Skill } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Flame, Blocks, Cpu } from 'lucide-react';
import { PINCH_UP_TRANSITION } from './About';

interface SkillsProps {
  isDarkMode: boolean;
}

const DEFAULT_SKILLS: Skill[] = [
  { name: 'TypeScript', category: 'Frontend', proficiency: 94 },
  { name: 'React', category: 'Frontend', proficiency: 96 },
  { name: 'TailwindCSS', category: 'Frontend', proficiency: 98 },
  { name: 'Kotlin', category: 'Mobile', proficiency: 88 },
  { name: 'Jetpack Compose', category: 'Mobile', proficiency: 85 },
  { name: 'Three.js / WebGL', category: 'Specialized', proficiency: 92 },
  { name: 'Node.js / Express', category: 'Backend', proficiency: 90 },
  { name: 'Firebase', category: 'Backend', proficiency: 91 }
];

export default function Skills({ isDarkMode }: SkillsProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track which skill was clicked for the 3D pop effect
  const [poppedSkillId, setPoppedSkillId] = useState<string | null>(null);

  useEffect(() => {
    const skillsCollection = collection(db, 'skills');
    const unsubscribe = onSnapshot(
      skillsCollection,
      (snapshot) => {
        const fetched: Skill[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as Skill);
        });

        if (fetched.length > 0) {
          setSkills(fetched);
        } else {
          setSkills(DEFAULT_SKILLS);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Failed to load skills, fallback to defaults:', error);
        setSkills(DEFAULT_SKILLS);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Category Colors helper
  const getCategoryTheme = (category: string) => {
    switch (category.toLowerCase()) {
      case 'frontend':
        return {
          glow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]',
          text: 'text-cyan-400',
          border: 'border-cyan-500/30',
          bar: 'bg-gradient-to-r from-cyan-400 to-indigo-500',
        };
      case 'backend':
        return {
          glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
          text: 'text-purple-400',
          border: 'border-purple-500/30',
          bar: 'bg-gradient-to-r from-purple-400 to-pink-500',
        };
      case 'mobile':
        return {
          glow: 'shadow-[0_0_20px_rgba(236,72,153,0.4)]',
          text: 'text-pink-400',
          border: 'border-pink-500/30',
          bar: 'bg-gradient-to-r from-pink-400 to-amber-500',
        };
      default:
        return {
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
          bar: 'bg-gradient-to-r from-emerald-400 to-cyan-500',
        };
    }
  };

  const handleSkillClick = (skillId: string) => {
    setPoppedSkillId(skillId);
    // Reset pop after sound or delay completion
    setTimeout(() => {
      setPoppedSkillId(null);
    }, 600);
  };

  return (
    <section id="skills" className="py-24 relative overflow-hidden px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-xs font-black tracking-widest uppercase mb-2 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 bg-clip-text text-transparent"
          >
            My Tech Stack
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className={`text-3xl md:text-6xl font-black tracking-tight leading-none ${
              isDarkMode ? 'text-white' : 'text-neutral-900'
            }`}
          >
            Technical Skillset
          </motion.h2>
          <p className={`text-xs md:text-sm max-w-md mx-auto mt-4 font-semibold ${isDarkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
            Click on any tech capsule below to trigger an explosive 3D vector pop animation!
          </p>
          <div className="h-1.5 w-20 mx-auto mt-4 rounded-full bg-gradient-to-r from-pink-500 to-purple-500" />
        </div>

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-12 h-12 border-4 border-t-transparent border-cyan-500 rounded-full animate-spin" />
            <p className="text-sm text-neutral-500 mt-4 animate-pulse font-bold">Querying proficiency ratios...</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {skills.map((skill, index) => {
              const skillId = skill.id || skill.name;
              const isPopped = poppedSkillId === skillId;
              const theme = getCategoryTheme(skill.category);

              return (
                <motion.div
                  key={skillId}
                  {...PINCH_UP_TRANSITION}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ type: 'spring', stiffness: 70, damping: 13, delay: index * 0.08 }}
                  onClick={() => handleSkillClick(skillId)}
                  // 3D physics pop animation triggers here
                  animate={isPopped ? {
                    scale: [1, 1.25, 0.9, 1.12, 1],
                    rotateZ: [0, 15, -15, 8, 0],
                    rotateX: [0, -20, 20, 0],
                    rotateY: [0, 20, -20, 0],
                    z: [0, 50, -10, 0]
                  } : {}}
                  whileHover={{ scale: 1.03, y: -4 }}
                  className={`relative p-6 rounded-3xl border backdrop-blur-md cursor-pointer transition-shadow duration-300 overflow-hidden ${
                    isDarkMode 
                      ? 'bg-neutral-950/70 border-cyan-500/20 hover:bg-neutral-900/30' 
                      : 'bg-white/85 border-indigo-100 hover:bg-neutral-50/50'
                  } ${isPopped ? theme.glow + ' ring-2 ring-pink-500' : ''}`}
                >
                  {/* Category icon indicator */}
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[9px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full border ${
                      isDarkMode 
                        ? 'bg-neutral-900 border-neutral-800 text-neutral-400' 
                        : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                    }`}>
                      {skill.category}
                    </span>
                    
                    {isPopped ? (
                      <Flame className="w-4 h-4 text-pink-500 animate-bounce" />
                    ) : (
                      <Blocks className="w-3.5 h-3.5 text-neutral-400 animate-pulse" />
                    )}
                  </div>

                  {/* Skill Name */}
                  <h3 className={`text-base font-black tracking-tight mb-3 ${
                    isDarkMode ? 'text-white' : 'text-neutral-900'
                  }`}>
                    {skill.name}
                  </h3>

                  {/* Range slider bar with neon gradient highlights */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black">
                      <span className="text-neutral-400">Proficiency</span>
                      <span className={theme.text}>{skill.proficiency}%</span>
                    </div>

                    <div className={`h-2.5 w-full rounded-full overflow-hidden border ${
                      isDarkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-neutral-100 border-neutral-200'
                    }`}>
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.proficiency}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        className={`h-full rounded-full ${theme.bar}`}
                      />
                    </div>
                  </div>

                  {/* Glowing 3D background pulse indicator for clicked state */}
                  <AnimatePresence>
                    {isPopped && (
                      <motion.div
                        initial={{ opacity: 0.8, scale: 0.5 }}
                        animate={{ opacity: 0, scale: 1.8 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-pink-500/20 to-purple-500/20 rounded-3xl pointer-events-none"
                      />
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
