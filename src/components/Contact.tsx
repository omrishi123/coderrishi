import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { motion } from 'motion/react';
import { Send, Mail, User, MessageSquare, Sparkles, CheckCircle2 } from 'lucide-react';

interface ContactProps {
  isDarkMode: boolean;
}

export default function Contact({ isDarkMode }: ContactProps) {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 3D floating item ref & mouse coordinates for parallax
  const prismRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 40; // max 40px translation
      const y = (e.clientY / innerHeight - 0.5) * 40;
      setCoords({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMsg('All fields are required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      // Calculate IST ISO Timestamp
      const istDateString = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const istISOString = new Date(istDateString).toISOString();

      const inquiryPayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        message: formData.message.trim(),
        timestamp: istISOString, // IST Timestamp
      };

      // Add to Firestore inquiries collection
      const inquiriesCollection = collection(db, 'inquiries');
      await addDoc(inquiriesCollection, inquiryPayload);

      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
      setErrorMsg('Database submission failed. Please try again.');
      // Handle using standard error framework
      handleFirestoreError(error, OperationType.CREATE, 'inquiries');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 relative overflow-hidden px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className={`text-xs font-bold tracking-widest uppercase mb-2 ${
              isDarkMode ? 'text-cyan-400' : 'text-indigo-600'
            }`}
          >
            Get In Touch
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ delay: 0.1 }}
            className={`text-3xl md:text-5xl font-extrabold tracking-tight ${
              isDarkMode ? 'text-white' : 'text-neutral-900'
            }`}
          >
            Contact Coder Rishi
          </motion.h2>
          <div className={`h-1 w-20 mx-auto mt-4 rounded-full ${
            isDarkMode ? 'bg-cyan-500' : 'bg-indigo-600'
          }`} />
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="lg:col-span-7"
          >
            <div className={`p-8 md:p-10 rounded-2xl border backdrop-blur-md ${
              isDarkMode 
                ? 'bg-neutral-950/40 border-neutral-800' 
                : 'bg-white/40 border-neutral-200'
            }`}>
              <h3 className={`text-xl font-bold mb-6 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-neutral-900'
              }`}>
                <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                Send Me A Message
              </h3>

              {submitted ? (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`p-8 text-center rounded-xl border ${
                    isDarkMode 
                      ? 'bg-neutral-900/60 border-cyan-500/20 text-cyan-100' 
                      : 'bg-indigo-50 border-indigo-200 text-indigo-900'
                  }`}
                >
                  <CheckCircle2 className={`w-14 h-14 mx-auto mb-4 animate-bounce ${
                    isDarkMode ? 'text-cyan-400' : 'text-indigo-600'
                  }`} />
                  <h4 className="text-lg font-bold mb-2">Message Sent Successfully!</h4>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mb-6">
                    Thank you for reaching out, Om Rishai (Coder Rishi) will review your query and respond shortly. A timestamp in IST has been recorded.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className={`px-5 py-2.5 text-xs font-bold rounded-full transition-colors border ${
                      isDarkMode 
                        ? 'bg-neutral-950 border-neutral-800 text-cyan-400 hover:text-white' 
                        : 'bg-white border-neutral-200 text-indigo-600 hover:text-indigo-800'
                    }`}
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {errorMsg && (
                    <div className="p-3 text-xs font-semibold rounded bg-red-500/10 border border-red-500/20 text-red-400">
                      {errorMsg}
                    </div>
                  )}

                  {/* Name field */}
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-2 ${
                      isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
                    }`}>
                      Your Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        type="text"
                        name="name"
                        maxLength={100}
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 text-sm font-medium rounded-xl border outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-neutral-900/40 border-neutral-800 text-white focus:border-cyan-500 focus:bg-neutral-900/80' 
                            : 'bg-white/50 border-neutral-200 text-neutral-900 focus:border-indigo-600 focus:bg-white'
                        }`}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  {/* Email field */}
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-2 ${
                      isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
                    }`}>
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                        <Mail className="w-4 h-4" />
                      </span>
                      <input
                        type="email"
                        name="email"
                        maxLength={100}
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 text-sm font-medium rounded-xl border outline-none transition-all ${
                          isDarkMode 
                            ? 'bg-neutral-900/40 border-neutral-800 text-white focus:border-cyan-500 focus:bg-neutral-900/80' 
                            : 'bg-white/50 border-neutral-200 text-neutral-900 focus:border-indigo-600 focus:bg-white'
                        }`}
                        placeholder="johndoe@gmail.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Message field */}
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-2 ${
                      isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
                    }`}>
                      Your Message
                    </label>
                    <div className="relative">
                      <span className="absolute top-3.5 left-3.5 text-neutral-500">
                        <MessageSquare className="w-4 h-4" />
                      </span>
                      <textarea
                        name="message"
                        maxLength={2000}
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-3 text-sm font-medium rounded-xl border outline-none transition-all resize-none ${
                          isDarkMode 
                            ? 'bg-neutral-900/40 border-neutral-800 text-white focus:border-cyan-500 focus:bg-neutral-900/80' 
                            : 'bg-white/50 border-neutral-200 text-neutral-900 focus:border-indigo-600 focus:bg-white'
                        }`}
                        placeholder="Let's build something epic together..."
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-4 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center space-x-2 border cursor-pointer ${
                      isDarkMode 
                        ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950 border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.45)]' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500 hover:shadow-[0_0_20px_rgba(79,70,229,0.35)]'
                    } disabled:opacity-50`}
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-t-transparent border-neutral-950 dark:border-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* 3D Floating Prism Parallax Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            className="lg:col-span-5 hidden lg:flex flex-col items-center justify-center relative py-12"
          >
            {/* 3D Mock Prism Container */}
            <div 
              ref={prismRef}
              className="relative w-64 h-64 flex items-center justify-center transition-all duration-300"
              style={{
                transform: `translate(${coords.x}px, ${coords.y}px) rotateX(${coords.y * -0.5}deg) rotateY(${coords.x * 0.5}deg)`,
                perspective: '1000px'
              }}
            >
              {/* Glow backdrop */}
              <div className={`absolute w-44 h-44 rounded-full filter blur-[60px] opacity-40 animate-pulse ${
                isDarkMode ? 'bg-cyan-500' : 'bg-indigo-500'
              }`} />

              {/* Floating glass card mimicking 3D dimensions */}
              <div className={`w-48 h-48 rounded-3xl border backdrop-blur-md p-6 flex flex-col justify-between shadow-2xl relative z-10 ${
                isDarkMode 
                  ? 'bg-neutral-950/50 border-cyan-500/20 shadow-cyan-500/5' 
                  : 'bg-white/50 border-indigo-200 shadow-indigo-500/5'
              }`}>
                <div className="flex justify-between items-start">
                  <div className={`p-2.5 rounded-2xl ${
                    isDarkMode ? 'bg-neutral-900 text-cyan-400' : 'bg-neutral-100 text-indigo-600'
                  }`}>
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 bg-neutral-100 dark:bg-neutral-900 px-2.5 py-1 rounded-full">
                    3D Space
                  </span>
                </div>
                
                <div>
                  <h4 className={`text-base font-extrabold tracking-tight mb-1 ${
                    isDarkMode ? 'text-white' : 'text-neutral-900'
                  }`}>
                    Om Rishai
                  </h4>
                  <p className="text-[10px] text-neutral-400">
                    omrishi2580@gmail.com
                  </p>
                </div>
              </div>

              {/* Outer Wire ring orbit */}
              <div className="absolute inset-0 border border-neutral-300 dark:border-neutral-800 rounded-full animate-spin-slow scale-110 border-dashed" />
              <div className="absolute inset-4 border border-cyan-500/20 dark:border-cyan-400/10 rounded-full animate-pulse scale-90" />
            </div>

            {/* Quick Contact metadata */}
            <div className="text-center mt-6">
              <p className={`text-xs font-semibold ${
                isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
              }`}>
                Based in Bangalore, India (IST Zone)
              </p>
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                Avg. response latency: &lt; 12 hours
              </p>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
