import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { SocialLink } from '../types';
import { motion } from 'motion/react';
import { Github, Linkedin, Twitter, Youtube, Globe, ArrowUpRight, Sparkles } from 'lucide-react';
import { PINCH_UP_TRANSITION } from './About';

interface SocialShowcaseProps {
  isDarkMode: boolean;
}

const DEFAULT_SOCIALS: SocialLink[] = [
  { platform: 'GitHub', url: 'https://github.com/omrishi2580', color: '#24292e' },
  { platform: 'LinkedIn', url: 'https://linkedin.com/in/omrishi2580', color: '#0a66c2' },
  { platform: 'Twitter', url: 'https://twitter.com/omrishi2580', color: '#1da1f2' },
  { platform: 'YouTube', url: 'https://youtube.com', color: '#ff0000' }
];

export default function SocialShowcase({ isDarkMode }: SocialShowcaseProps) {
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socialsCollection = collection(db, 'socials');
    const unsubscribe = onSnapshot(
      socialsCollection,
      (snapshot) => {
        const fetched: SocialLink[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as SocialLink);
        });

        if (fetched.length > 0) {
          setSocials(fetched);
        } else {
          setSocials(DEFAULT_SOCIALS);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Failed to load socials, fallback to default:', error);
        setSocials(DEFAULT_SOCIALS);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'github':
        return Github;
      case 'linkedin':
        return Linkedin;
      case 'twitter':
      case 'x':
        return Twitter;
      case 'youtube':
        return Youtube;
      default:
        return Globe;
    }
  };

  return (
    <section id="socials" className="py-20 relative overflow-hidden px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="text-xs font-black tracking-widest uppercase mb-2 bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent"
          >
            Digital Footprint
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className={`text-2xl md:text-5xl font-black tracking-tight leading-none ${
              isDarkMode ? 'text-white' : 'text-neutral-900'
            }`}
          >
            Connect in 3D Space
          </motion.h2>
          <div className="h-1.5 w-16 mx-auto mt-4 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500" />
        </div>

        {loading ? (
          <div className="text-center py-10 text-xs font-semibold text-neutral-500">
            Scanning network nodes...
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {socials.map((social, index) => {
              const IconComp = getPlatformIcon(social.platform);
              
              return (
                <motion.a
                  key={social.id || social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...PINCH_UP_TRANSITION}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ type: 'spring', stiffness: 80, damping: 14, delay: index * 0.1 }}
                  whileHover={{ 
                    scale: 1.08, 
                    y: -10,
                    rotateX: -10,
                    rotateY: 10,
                    boxShadow: isDarkMode 
                      ? `0 15px 35px -5px ${social.color}40, 0 0 20px -2px ${social.color}60`
                      : `0 15px 35px -5px ${social.color}25`
                  }}
                  style={{ transformStyle: 'preserve-3d' }}
                  className={`group p-6 rounded-3xl border flex flex-col items-center justify-center text-center transition-all duration-300 relative overflow-hidden backdrop-blur-md cursor-pointer ${
                    isDarkMode 
                      ? 'bg-neutral-950/80 border-cyan-500/20' 
                      : 'bg-white/85 border-indigo-100'
                  }`}
                >
                  {/* Decorative glowing back plate color */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                    style={{ backgroundColor: social.color }}
                  />

                  {/* 3D layered icon indicator */}
                  <div 
                    className="p-4 rounded-2xl border transition-transform duration-300 group-hover:translate-z-10 group-hover:scale-110 mb-4"
                    style={{ 
                      borderColor: `${social.color}30`, 
                      backgroundColor: isDarkMode ? '#0a0a0f' : '#f9f9fb',
                      color: social.color
                    }}
                  >
                    <IconComp className="w-6 h-6 animate-pulse" />
                  </div>

                  {/* Platform Name */}
                  <span className={`text-sm font-black tracking-tight mb-1 group-hover:translate-z-8 ${
                    isDarkMode ? 'text-white' : 'text-neutral-900'
                  }`}>
                    {social.platform}
                  </span>

                  {/* Arrow visual hover anchor */}
                  <div className="flex items-center gap-1 text-[10px] font-black text-neutral-400 dark:text-neutral-500 group-hover:text-pink-500 transition-colors">
                    <span>Follow</span>
                    <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </motion.a>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
