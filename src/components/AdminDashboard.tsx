import React, { useState, useEffect, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';
import { Project, Skill, Inquiry, AboutDetails, SocialLink, UserProfile } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FolderGit2, Award, Mail, Plus, Trash2, Edit2, LogOut, CheckCircle2, 
  HelpCircle, ShieldAlert, Sliders, ExternalLink, Image, User, Link, Users,
  Upload, Sparkles, Check
} from 'lucide-react';

interface AdminDashboardProps {
  isDarkMode: boolean;
  onLogout: () => void;
}

type TabType = 'projects' | 'skills' | 'about' | 'socials' | 'users' | 'inquiries';

export default function AdminDashboard({ isDarkMode, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('projects');
  
  // Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [aboutMe, setAboutMe] = useState<AboutDetails | null>(null);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [adminUsers, setAdminUsers] = useState<UserProfile[]>([]);
  
  // Loading States
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingSkills, setLoadingSkills] = useState(true);
  const [loadingInquiries, setLoadingInquiries] = useState(true);
  const [loadingAbout, setLoadingAbout] = useState(true);
  const [loadingSocials, setLoadingSocials] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Form States - Project
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projTechs, setProjTechs] = useState('');
  const [projImageBase64, setProjImageBase64] = useState('');
  const [projGithub, setProjGithub] = useState('');
  const [projLive, setProjLive] = useState('');

  // Form States - Skill
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillName, setSkillName] = useState('');
  const [skillCat, setSkillCat] = useState('Frontend');
  const [skillProf, setSkillProf] = useState(80);

  // Form States - About Me CMS
  const [aboutFullName, setAboutFullName] = useState('');
  const [aboutBrandName, setAboutBrandName] = useState('');
  const [aboutBioText, setAboutBioText] = useState('');
  const [aboutAddBio, setAboutAddBio] = useState('');
  const [aboutPhotoBase64, setAboutPhotoBase64] = useState('');

  // Form States - Social Link
  const [editingSocial, setEditingSocial] = useState<SocialLink | null>(null);
  const [socialPlatform, setSocialPlatform] = useState('GitHub');
  const [socialUrl, setSocialUrl] = useState('');
  const [socialColor, setSocialColor] = useState('#6366f1');

  // Form States - Invite New Admin
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  
  // Status Indicator
  const [actionSuccess, setActionSuccess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // File drag states
  const [projectDragOver, setProjectDragOver] = useState(false);
  const [aboutDragOver, setAboutDragOver] = useState(false);

  // Subscriptions
  useEffect(() => {
    // 1. Subscribe to Projects
    const unsubProjects = onSnapshot(
      collection(db, 'projects'),
      (snapshot) => {
        const fetched: Project[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as Project);
        });
        setProjects(fetched);
        setLoadingProjects(false);
      },
      (error) => console.error('Projects sync failed:', error)
    );

    // 2. Subscribe to Skills
    const unsubSkills = onSnapshot(
      collection(db, 'skills'),
      (snapshot) => {
        const fetched: Skill[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as Skill);
        });
        setSkills(fetched);
        setLoadingSkills(false);
      },
      (error) => console.error('Skills sync failed:', error)
    );

    // 3. Subscribe to Inquiries
    const unsubInquiries = onSnapshot(
      collection(db, 'inquiries'),
      (snapshot) => {
        const fetched: Inquiry[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as Inquiry);
        });
        fetched.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setInquiries(fetched);
        setLoadingInquiries(false);
      },
      (error) => console.error('Inquiries sync failed:', error)
    );

    // 4. Subscribe to About Me Details
    const unsubAbout = onSnapshot(
      collection(db, 'about'),
      (snapshot) => {
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          const data = { id: docSnap.id, ...docSnap.data() } as AboutDetails;
          setAboutMe(data);
          setAboutFullName(data.fullName || '');
          setAboutBrandName(data.brandName || '');
          setAboutBioText(data.bioText || '');
          setAboutAddBio(data.additionalBio || '');
          setAboutPhotoBase64(data.profilePhotoBase64 || '');
        }
        setLoadingAbout(false);
      },
      (error) => console.error('About details sync failed:', error)
    );

    // 5. Subscribe to Socials
    const unsubSocials = onSnapshot(
      collection(db, 'socials'),
      (snapshot) => {
        const fetched: SocialLink[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as SocialLink);
        });
        setSocials(fetched);
        setLoadingSocials(false);
      },
      (error) => console.error('Socials sync failed:', error)
    );

    // 6. Subscribe to Users
    const unsubUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const fetched: UserProfile[] = [];
        snapshot.forEach((doc) => {
          fetched.push({ id: doc.id, ...doc.data() } as UserProfile);
        });
        setAdminUsers(fetched);
        setLoadingUsers(false);
      },
      (error) => console.error('Admin users sync failed:', error)
    );

    return () => {
      unsubProjects();
      unsubSkills();
      unsubInquiries();
      unsubAbout();
      unsubSocials();
      unsubUsers();
    };
  }, []);

  const triggerSuccess = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  const triggerError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 5000);
  };

  // Convert files helper to Base64
  const processImageFile = (file: File, onDone: (base64: string) => void) => {
    if (!file.type.startsWith('image/')) {
      triggerError('Invalid file! Please upload an image file (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.src = reader.result as string;
      img.onload = () => {
        // High fidelity canvas compressor to keep standard base64 size optimized
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Constraint max dimension
        const MAX_DIM = 1000;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.82); // high quality 82%
          onDone(compressedBase64);
        }
      };
    };
    reader.onerror = (err) => {
      console.error(err);
      triggerError('Failed to parse uploaded image file.');
    };
    reader.readAsDataURL(file);
  };

  // Drag-and-drop handlers - Projects
  const handleProjectDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setProjectDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0], (b64) => {
        setProjImageBase64(b64);
        triggerSuccess('High-fidelity image successfully queued.');
      });
    }
  };

  const handleProjectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0], (b64) => {
        setProjImageBase64(b64);
        triggerSuccess('High-fidelity image loaded.');
      });
    }
  };

  // Drag-and-drop handlers - About Me
  const handleAboutDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setAboutDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0], (b64) => {
        setAboutPhotoBase64(b64);
        triggerSuccess('Profile picture queued.');
      });
    }
  };

  const handleAboutFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0], (b64) => {
        setAboutPhotoBase64(b64);
        triggerSuccess('Profile picture loaded.');
      });
    }
  };

  // --- SAVE ACTIONS ---
  
  // Save Project
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle || !projDesc || !projImageBase64) {
      triggerError('Required: Title, Description, and Project Mockup Image!');
      return;
    }

    const techArray = projTechs
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const projectPayload = {
      title: projTitle.trim(),
      description: projDesc.trim(),
      techStack: techArray,
      imageUrl: projImageBase64,
      githubLink: projGithub.trim() || '',
      liveLink: projLive.trim() || '',
    };

    try {
      if (editingProject?.id) {
        const docRef = doc(db, 'projects', editingProject.id);
        await updateDoc(docRef, projectPayload);
        triggerSuccess(`Project "${projTitle}" successfully updated.`);
      } else {
        await addDoc(collection(db, 'projects'), projectPayload);
        triggerSuccess(`Project "${projTitle}" successfully published.`);
      }

      // Reset
      setEditingProject(null);
      setProjTitle('');
      setProjDesc('');
      setProjTechs('');
      setProjImageBase64('');
      setProjGithub('');
      setProjLive('');
    } catch (error) {
      console.error('Save project error:', error);
      handleFirestoreError(error, editingProject ? OperationType.UPDATE : OperationType.CREATE, 'projects');
    }
  };

  const handleEditProjectClick = (proj: Project) => {
    setEditingProject(proj);
    setProjTitle(proj.title);
    setProjDesc(proj.description);
    setProjTechs(proj.techStack.join(', '));
    setProjImageBase64(proj.imageUrl);
    setProjGithub(proj.githubLink || '');
    setProjLive(proj.liveLink || '');
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteDoc(doc(db, 'projects', id));
      triggerSuccess(`Project "${title}" successfully removed.`);
    } catch (error) {
      console.error('Delete project error:', error);
      handleFirestoreError(error, OperationType.DELETE, `projects/${id}`);
    }
  };

  // Save Skill
  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName || !skillCat) {
      triggerError('Required: Skill Name and Category');
      return;
    }

    const skillPayload = {
      name: skillName.trim(),
      category: skillCat,
      proficiency: Number(skillProf),
    };

    try {
      if (editingSkill?.id) {
        const docRef = doc(db, 'skills', editingSkill.id);
        await updateDoc(docRef, skillPayload);
        triggerSuccess(`Skill "${skillName}" successfully updated.`);
      } else {
        await addDoc(collection(db, 'skills'), skillPayload);
        triggerSuccess(`Skill "${skillName}" successfully added.`);
      }

      setEditingSkill(null);
      setSkillName('');
      setSkillCat('Frontend');
      setSkillProf(80);
    } catch (error) {
      console.error('Save skill error:', error);
      handleFirestoreError(error, editingSkill ? OperationType.UPDATE : OperationType.CREATE, 'skills');
    }
  };

  const handleEditSkillClick = (sk: Skill) => {
    setEditingSkill(sk);
    setSkillName(sk.name);
    setSkillCat(sk.category);
    setSkillProf(sk.proficiency);
  };

  const handleDeleteSkill = async (id: string, name: string) => {
    if (!confirm(`Remove skill "${name}"?`)) return;
    try {
      await deleteDoc(doc(db, 'skills', id));
      triggerSuccess(`Skill "${name}" successfully deleted.`);
    } catch (error) {
      console.error('Delete skill error:', error);
      handleFirestoreError(error, OperationType.DELETE, `skills/${id}`);
    }
  };

  // Save About Details
  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aboutFullName || !aboutBioText) {
      triggerError('Required: Full Name and Biography!');
      return;
    }

    const aboutPayload = {
      fullName: aboutFullName.trim(),
      brandName: aboutBrandName.trim(),
      bioText: aboutBioText.trim(),
      additionalBio: aboutAddBio.trim(),
      profilePhotoBase64: aboutPhotoBase64,
    };

    try {
      if (aboutMe?.id) {
        const docRef = doc(db, 'about', aboutMe.id);
        await updateDoc(docRef, aboutPayload);
      } else {
        // If empty, pre-create doc with standardized ID 'details'
        await setDoc(doc(db, 'about', 'details'), aboutPayload);
      }
      triggerSuccess('About Me profile details saved securely to Firestore.');
    } catch (error) {
      console.error('Save about details error:', error);
      triggerError('Access denied! Check admin security permissions.');
    }
  };

  // Save Social Link
  const handleSaveSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialPlatform || !socialUrl) {
      triggerError('Required: Platform Name and Target URL!');
      return;
    }

    const socialPayload = {
      platform: socialPlatform.trim(),
      url: socialUrl.trim(),
      color: socialColor,
    };

    try {
      if (editingSocial?.id) {
        const docRef = doc(db, 'socials', editingSocial.id);
        await updateDoc(docRef, socialPayload);
        triggerSuccess(`Platform link "${socialPlatform}" updated.`);
      } else {
        await addDoc(collection(db, 'socials'), socialPayload);
        triggerSuccess(`Platform link "${socialPlatform}" added.`);
      }

      setEditingSocial(null);
      setSocialPlatform('GitHub');
      setSocialUrl('');
      setSocialColor('#6366f1');
    } catch (error) {
      console.error('Save social link error:', error);
      triggerError('Failed to save social link.');
    }
  };

  const handleEditSocialClick = (soc: SocialLink) => {
    setEditingSocial(soc);
    setSocialPlatform(soc.platform);
    setSocialUrl(soc.url);
    setSocialColor(soc.color);
  };

  const handleDeleteSocial = async (id: string, platform: string) => {
    if (!confirm(`Delete "${platform}" social card?`)) return;
    try {
      await deleteDoc(doc(db, 'socials', id));
      triggerSuccess(`Platform "${platform}" removed.`);
    } catch (error) {
      console.error('Delete social error:', error);
    }
  };

  // Assign/Add new administrator accounts directly to users collection
  const handleCreateAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) {
      triggerError('Provide a valid email address!');
      return;
    }

    try {
      // Create user document with admin privilege
      // We hash or key it by safe sanitization
      const safeId = newAdminEmail.replace(/[^a-zA-Z0-9]/g, '_');
      await setDoc(doc(db, 'users', safeId), {
        email: newAdminEmail.trim().toLowerCase(),
        role: 'admin'
      });

      triggerSuccess(`Email "${newAdminEmail}" has been registered with Administrator privilege.`);
      setNewAdminEmail('');
    } catch (error) {
      console.error('Create admin error:', error);
      triggerError('Failed to grant admin privileges. Check security guidelines.');
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (!confirm('Permanently delete this visitor message?')) return;
    try {
      await deleteDoc(doc(db, 'inquiries', id));
      triggerSuccess('Inquiry deleted successfully.');
    } catch (error) {
      console.error('Delete inquiry error:', error);
      handleFirestoreError(error, OperationType.DELETE, `inquiries/${id}`);
    }
  };

  return (
    <div className="py-24 px-6 max-w-7xl mx-auto min-h-screen">
      
      {/* Top Banner Status Notification */}
      <AnimatePresence>
        {actionSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-emerald-400"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </motion.div>
        )}
        
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white font-extrabold text-xs px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-red-500"
          >
            <ShieldAlert className="w-4 h-4 animate-bounce" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-neutral-800/10 dark:border-neutral-800/30 pb-6">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-neutral-900 text-cyan-400">
            Authorized Admin Studio
          </span>
          <h1 className={`text-2xl md:text-4xl font-black tracking-tight mt-2 ${
            isDarkMode ? 'text-white' : 'text-neutral-950'
          }`}>
            Portfolio Control Panel
          </h1>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer w-fit"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Session</span>
        </button>
      </div>

      {/* Main Tab Controls */}
      <div className="flex flex-wrap gap-2 mb-10 border-b border-neutral-800/10 dark:border-neutral-800/20 pb-4">
        {[
          { id: 'projects', label: 'Projects Grid', icon: FolderGit2 },
          { id: 'skills', label: 'Tech Skills', icon: Award },
          { id: 'about', label: 'About Info', icon: User },
          { id: 'socials', label: '3D Socials', icon: Link },
          { id: 'users', label: 'Add Admin Accounts', icon: Users },
          { id: 'inquiries', label: 'Inquiries Inbox', icon: Mail }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)]' 
                  : isDarkMode 
                    ? 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white' 
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-950'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}

      {/* 1. PROJECTS TAB (with high quality base64 upload and drag/drop) */}
      {activeTab === 'projects' && (
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Editor Form */}
          <div className="lg:col-span-5">
            <div className={`p-6 rounded-3xl border backdrop-blur-md ${
              isDarkMode ? 'bg-neutral-950/80 border-cyan-500/20' : 'bg-white border-indigo-100 shadow-xl'
            }`}>
              <h3 className={`text-base font-black mb-6 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-neutral-900'
              }`}>
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <span>{editingProject ? 'Edit Showcase Project' : 'Publish New Project'}</span>
              </h3>

              <form onSubmit={handleSaveProject} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-neutral-400">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={projTitle}
                    onChange={(e) => setProjTitle(e.target.value)}
                    placeholder="e.g. Carbon Genesis"
                    className={`w-full p-3 rounded-xl border text-xs font-semibold ${
                      isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white focus:border-cyan-400' : 'bg-neutral-50 border-neutral-200 text-neutral-950'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-neutral-400">
                    Description
                  </label>
                  <textarea
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    rows={3}
                    placeholder="Provide a description of features, tech..."
                    className={`w-full p-3 rounded-xl border text-xs font-semibold ${
                      isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white focus:border-cyan-400' : 'bg-neutral-50 border-neutral-200 text-neutral-950'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-neutral-400">
                    Tech Stack (comma separated)
                  </label>
                  <input
                    type="text"
                    value={projTechs}
                    onChange={(e) => setProjTechs(e.target.value)}
                    placeholder="React, TypeScript, Three.js"
                    className={`w-full p-3 rounded-xl border text-xs font-semibold ${
                      isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white focus:border-cyan-400' : 'bg-neutral-50 border-neutral-200 text-neutral-950'
                    }`}
                  />
                </div>

                {/* DRAG AND DROP HIGH FIDELITY IMAGE FILE SELECTOR */}
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-neutral-400">
                    Mockup Web Screenshot (Base64 High Quality Upload)
                  </label>
                  
                  <div
                    onDragOver={(e) => { e.preventDefault(); setProjectDragOver(true); }}
                    onDragLeave={() => setProjectDragOver(false)}
                    onDrop={handleProjectDrop}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                      projectDragOver 
                        ? 'border-pink-500 bg-pink-500/5' 
                        : isDarkMode 
                          ? 'border-neutral-800 hover:border-cyan-400 bg-neutral-900/50' 
                          : 'border-neutral-200 hover:border-indigo-400 bg-neutral-50'
                    }`}
                  >
                    {projImageBase64 ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={projImageBase64} 
                          alt="preview" 
                          className="h-28 rounded-xl object-cover mb-3 shadow-md border border-neutral-800"
                        />
                        <button
                          type="button"
                          onClick={() => setProjImageBase64('')}
                          className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:underline"
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center cursor-pointer relative">
                        <Upload className="w-8 h-8 text-neutral-500 mb-2 animate-bounce" />
                        <span className="text-[10px] font-black uppercase tracking-wider mb-1">
                          Drag &amp; Drop Site Image
                        </span>
                        <span className="text-[9px] text-neutral-500 mb-3">
                          or click to choose image file
                        </span>
                        
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProjectFileChange}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-neutral-400">
                      GitHub URL
                    </label>
                    <input
                      type="url"
                      value={projGithub}
                      onChange={(e) => setProjGithub(e.target.value)}
                      placeholder="https://github.com/..."
                      className={`w-full p-3 rounded-xl border text-xs font-semibold ${
                        isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white focus:border-cyan-400' : 'bg-neutral-50 border-neutral-200 text-neutral-950'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-neutral-400">
                      Live App URL (Required for 3D Preview)
                    </label>
                    <input
                      type="url"
                      value={projLive}
                      onChange={(e) => setProjLive(e.target.value)}
                      placeholder="https://..."
                      className={`w-full p-3 rounded-xl border text-xs font-semibold ${
                        isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white focus:border-cyan-400' : 'bg-neutral-50 border-neutral-200 text-neutral-950'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-grow py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 transition-shadow hover:shadow-[0_0_15px_rgba(236,72,153,0.3)] cursor-pointer"
                  >
                    {editingProject ? 'Apply Update' : 'Publish Showcase'}
                  </button>
                  {editingProject && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingProject(null);
                        setProjTitle('');
                        setProjDesc('');
                        setProjTechs('');
                        setProjImageBase64('');
                        setProjGithub('');
                        setProjLive('');
                      }}
                      className={`px-4 rounded-xl text-xs font-black uppercase tracking-wider border ${
                        isDarkMode ? 'border-neutral-800 text-neutral-400 hover:bg-neutral-900' : 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                      }`}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* List Area */}
          <div className="lg:col-span-7">
            <h3 className={`text-sm font-black mb-6 uppercase tracking-wider ${
              isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
            }`}>
              Live Projects ({projects.length})
            </h3>

            {loadingProjects ? (
              <div className="text-center py-10 text-xs font-semibold text-neutral-500 animate-pulse">
                Fetching showcased units...
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div
                    key={proj.id || proj.title}
                    className={`p-4 rounded-2xl border flex gap-4 items-center ${
                      isDarkMode ? 'bg-neutral-950/40 border-neutral-800/80' : 'bg-white border-neutral-200 shadow-sm'
                    }`}
                  >
                    {proj.imageUrl ? (
                      <img 
                        src={proj.imageUrl} 
                        alt="showcase" 
                        className="w-20 h-14 rounded-lg object-cover border border-neutral-800"
                      />
                    ) : (
                      <div className="w-20 h-14 rounded-lg bg-neutral-900 flex items-center justify-center border border-neutral-800">
                        <Image className="w-5 h-5 text-neutral-700" />
                      </div>
                    )}

                    <div className="flex-grow min-w-0">
                      <h4 className={`text-sm font-black truncate ${
                        isDarkMode ? 'text-white' : 'text-neutral-900'
                      }`}>
                        {proj.title}
                      </h4>
                      <p className="text-[10px] text-neutral-500 truncate max-w-sm mt-0.5">
                        {proj.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditProjectClick(proj)}
                        className={`p-2 rounded-lg border transition-colors ${
                          isDarkMode ? 'hover:bg-neutral-800 border-neutral-800 text-cyan-400' : 'hover:bg-neutral-100 border-neutral-200 text-indigo-600'
                        }`}
                        title="Edit detail"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id!, proj.title)}
                        className="p-2 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-500 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. SKILLS TAB */}
      {activeTab === 'skills' && (
        <div className="grid lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5">
            <div className={`p-6 rounded-3xl border backdrop-blur-md ${
              isDarkMode ? 'bg-neutral-950/80 border-cyan-500/20' : 'bg-white border-indigo-100 shadow-xl'
            }`}>
              <h3 className={`text-base font-black mb-6 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-neutral-900'
              }`}>
                <Award className="w-5 h-5 text-cyan-400" />
                <span>{editingSkill ? 'Edit Skill Spec' : 'Add Tech Capability'}</span>
              </h3>

              <form onSubmit={handleSaveSkill} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-neutral-400">
                    Skill/Library Name
                  </label>
                  <input
                    type="text"
                    value={skillName}
                    onChange={(e) => setSkillName(e.target.value)}
                    placeholder="e.g. TypeScript"
                    className={`w-full p-3 rounded-xl border text-xs font-semibold ${
                      isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-neutral-400">
                    Category Tag
                  </label>
                  <select
                    value={skillCat}
                    onChange={(e) => setSkillCat(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-xs font-bold ${
                      isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'
                    }`}
                  >
                    <option value="Frontend">Frontend Frameworks</option>
                    <option value="Backend">Backend / Cloud Services</option>
                    <option value="Mobile">Native Mobile Dev</option>
                    <option value="Specialized">Specialized Tech (3D, WebAssembly)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-wider mb-1 text-neutral-400">
                    <span>Proficiency Ratio</span>
                    <span className="text-cyan-400">{skillProf}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={skillProf}
                    onChange={(e) => setSkillProf(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-2 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-grow py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-cyan-400 to-indigo-500 transition-shadow hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
                  >
                    {editingSkill ? 'Update Tech' : 'Publish Tech Card'}
                  </button>
                  {editingSkill && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSkill(null);
                        setSkillName('');
                        setSkillCat('Frontend');
                        setSkillProf(80);
                      }}
                      className={`px-4 rounded-xl text-xs font-black uppercase tracking-wider border ${
                        isDarkMode ? 'border-neutral-800 text-neutral-400 hover:bg-neutral-900' : 'border-neutral-200 text-neutral-600'
                      }`}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7">
            <h3 className={`text-sm font-black mb-6 uppercase tracking-wider ${
              isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
            }`}>
              Tech Stack List ({skills.length})
            </h3>

            {loadingSkills ? (
              <div className="text-center py-10 text-xs font-semibold text-neutral-500 animate-pulse">
                Fetching parameters...
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {skills.map((sk) => (
                  <div
                    key={sk.id || sk.name}
                    className={`p-4 rounded-2xl border flex items-center justify-between ${
                      isDarkMode ? 'bg-neutral-950/40 border-neutral-800/80' : 'bg-white border-neutral-200'
                    }`}
                  >
                    <div>
                      <h4 className={`text-sm font-black ${
                        isDarkMode ? 'text-white' : 'text-neutral-900'
                      }`}>
                        {sk.name}
                      </h4>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-500">
                        {sk.category} &bull; {sk.proficiency}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditSkillClick(sk)}
                        className={`p-2 rounded-lg border transition-colors ${
                          isDarkMode ? 'hover:bg-neutral-800 border-neutral-800 text-cyan-400' : 'hover:bg-neutral-100 border-neutral-200 text-indigo-600'
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSkill(sk.id!, sk.name)}
                        className="p-2 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. ABOUT DETAILS TAB (Control everything, base64 profiles, high-quality drag/drop upload) */}
      {activeTab === 'about' && (
        <div className="max-w-3xl mx-auto">
          <div className={`p-8 rounded-3xl border backdrop-blur-md ${
            isDarkMode ? 'bg-neutral-950/80 border-cyan-500/20' : 'bg-white border-indigo-100 shadow-xl'
          }`}>
            <h3 className={`text-base font-black mb-6 flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-neutral-900'
            }`}>
              <User className="w-5 h-5 text-pink-500" />
              <span>Modify Biography &amp; Profile Photo</span>
            </h3>

            <form onSubmit={handleSaveAbout} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-neutral-400">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={aboutFullName}
                    onChange={(e) => setAboutFullName(e.target.value)}
                    placeholder="Om Rishai"
                    className={`w-full p-3 rounded-xl border text-xs font-semibold ${
                      isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-neutral-400">
                    Slogan / Brand Name
                  </label>
                  <input
                    type="text"
                    value={aboutBrandName}
                    onChange={(e) => setAboutBrandName(e.target.value)}
                    placeholder="Coder Rishi"
                    className={`w-full p-3 rounded-xl border text-xs font-semibold ${
                      isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-neutral-400">
                  Biography Paragraph (Core)
                </label>
                <textarea
                  value={aboutBioText}
                  onChange={(e) => setAboutBioText(e.target.value)}
                  rows={4}
                  placeholder="Tell about your professional background..."
                  className={`w-full p-3 rounded-xl border text-xs font-semibold ${
                    isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-neutral-400">
                  Biography Paragraph (Secondary)
                </label>
                <textarea
                  value={aboutAddBio}
                  onChange={(e) => setAboutAddBio(e.target.value)}
                  rows={3}
                  placeholder="Additional context, tech interests..."
                  className={`w-full p-3 rounded-xl border text-xs font-semibold ${
                    isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'
                  }`}
                />
              </div>

              {/* PROFILE PHOTO HIGH-QUALITY BASE64 FILE SELECTOR */}
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-neutral-400">
                  Profile Avatar Photo (High-Fidelity Base64 Compressor)
                </label>

                <div
                  onDragOver={(e) => { e.preventDefault(); setAboutDragOver(true); }}
                  onDragLeave={() => setAboutDragOver(false)}
                  onDrop={handleAboutDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                    aboutDragOver 
                      ? 'border-pink-500 bg-pink-500/5' 
                      : isDarkMode 
                        ? 'border-neutral-800 hover:border-cyan-400 bg-neutral-900/50' 
                        : 'border-neutral-200 hover:border-indigo-400 bg-neutral-50'
                  }`}
                >
                  {aboutPhotoBase64 ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={aboutPhotoBase64} 
                        alt="profile preview" 
                        className="w-32 h-32 rounded-full object-cover mb-3 shadow-lg border-2 border-pink-500"
                      />
                      <button
                        type="button"
                        onClick={() => setAboutPhotoBase64('')}
                        className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:underline"
                      >
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center cursor-pointer relative">
                      <Upload className="w-8 h-8 text-neutral-500 mb-2 animate-bounce" />
                      <span className="text-[10px] font-black uppercase tracking-wider mb-1">
                        Drag &amp; Drop Profile Picture
                      </span>
                      <span className="text-[9px] text-neutral-500 mb-3">
                        or click to browse local files
                      </span>
                      
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAboutFileChange}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer"
              >
                Save Profile Configuration
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. SOCIAL MEDIA LINKS TAB (CMS) */}
      {activeTab === 'socials' && (
        <div className="grid lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-5">
            <div className={`p-6 rounded-3xl border backdrop-blur-md ${
              isDarkMode ? 'bg-neutral-950/80 border-cyan-500/20' : 'bg-white border-indigo-100 shadow-xl'
            }`}>
              <h3 className={`text-base font-black mb-6 flex items-center gap-2 ${
                isDarkMode ? 'text-white' : 'text-neutral-900'
              }`}>
                <Link className="w-5 h-5 text-indigo-400" />
                <span>{editingSocial ? 'Edit Social Link' : 'Add Social Network Card'}</span>
              </h3>

              <form onSubmit={handleSaveSocial} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-neutral-400">
                    Platform Name
                  </label>
                  <select
                    value={socialPlatform}
                    onChange={(e) => setSocialPlatform(e.target.value)}
                    className={`w-full p-3 rounded-xl border text-xs font-bold ${
                      isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'
                    }`}
                  >
                    <option value="GitHub">GitHub</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Twitter">Twitter / X</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Portfolio">Custom URL</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-neutral-400">
                    Target Profile URL
                  </label>
                  <input
                    type="url"
                    value={socialUrl}
                    onChange={(e) => setSocialUrl(e.target.value)}
                    placeholder="https://..."
                    className={`w-full p-3 rounded-xl border text-xs font-semibold ${
                      isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-neutral-400">
                    Platform Brand Hex Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={socialColor}
                      onChange={(e) => setSocialColor(e.target.value)}
                      className="w-12 h-10 border-0 rounded-lg cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={socialColor}
                      onChange={(e) => setSocialColor(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border text-xs font-semibold ${
                        isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'
                      }`}
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-grow py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-indigo-500 to-cyan-400 transition-shadow hover:shadow-[0_0_15px_rgba(79,70,229,0.3)] cursor-pointer"
                  >
                    {editingSocial ? 'Save Link' : 'Add Card'}
                  </button>
                  {editingSocial && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSocial(null);
                        setSocialPlatform('GitHub');
                        setSocialUrl('');
                        setSocialColor('#6366f1');
                      }}
                      className={`px-4 rounded-xl text-xs font-black uppercase tracking-wider border ${
                        isDarkMode ? 'border-neutral-800 text-neutral-400 hover:bg-neutral-900' : 'border-neutral-200 text-neutral-600'
                      }`}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-7">
            <h3 className={`text-sm font-black mb-6 uppercase tracking-wider ${
              isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
            }`}>
              Configured Links ({socials.length})
            </h3>

            {loadingSocials ? (
              <div className="text-center py-10 text-xs font-semibold text-neutral-500">
                Loading...
              </div>
            ) : (
              <div className="space-y-4">
                {socials.map((soc) => (
                  <div
                    key={soc.id || soc.platform}
                    className={`p-4 rounded-2xl border flex items-center justify-between ${
                      isDarkMode ? 'bg-neutral-950/40 border-neutral-800/80' : 'bg-white border-neutral-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4.5 h-4.5 rounded-full" 
                        style={{ backgroundColor: soc.color }}
                      />
                      <div>
                        <h4 className={`text-sm font-black ${
                          isDarkMode ? 'text-white' : 'text-neutral-900'
                        }`}>
                          {soc.platform}
                        </h4>
                        <span className="text-[10px] text-neutral-500 truncate max-w-xs block">
                          {soc.url}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditSocialClick(soc)}
                        className={`p-2 rounded-lg border transition-colors ${
                          isDarkMode ? 'hover:bg-neutral-800 border-neutral-800 text-cyan-400' : 'hover:bg-neutral-100 border-neutral-200 text-indigo-600'
                        }`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSocial(soc.id!, soc.platform)}
                        className="p-2 rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. ADD MORE ADMINS TAB */}
      {activeTab === 'users' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className={`p-8 rounded-3xl border backdrop-blur-md ${
            isDarkMode ? 'bg-neutral-950/80 border-cyan-500/20' : 'bg-white border-indigo-100 shadow-xl'
          }`}>
            <h3 className={`text-base font-black mb-4 flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-neutral-900'
            }`}>
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Grant Admin Privilege</span>
            </h3>
            
            <p className="text-[11px] text-neutral-500 leading-relaxed mb-6">
              When you add another email below, their address gets written into the Firestore secure <code>/users</code> credentials index. They will be authorized to access the Admin CMS console by heading directly to <code>/admin</code>.
            </p>

            <form onSubmit={handleCreateAdminUser} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider mb-1 text-neutral-400">
                  New Admin User Email
                </label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="e.g. colleague@company.com"
                  className={`w-full p-3 rounded-xl border text-xs font-semibold ${
                    isDarkMode ? 'bg-neutral-900 border-neutral-800 text-white' : 'bg-neutral-50 border-neutral-200'
                  }`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-cyan-500 hover:bg-cyan-400 transition-shadow hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] text-neutral-950 cursor-pointer"
              >
                Authorize New Email as Admin
              </button>
            </form>
          </div>

          <div className={`p-6 rounded-3xl border ${
            isDarkMode ? 'bg-neutral-950/40 border-neutral-800' : 'bg-white border-neutral-200'
          }`}>
            <h4 className={`text-xs font-black uppercase tracking-widest mb-4 ${
              isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
            }`}>
              Registered Admins ({adminUsers.length})
            </h4>

            {loadingUsers ? (
              <div className="text-xs text-neutral-500">Retrieving admin list...</div>
            ) : (
              <div className="space-y-2">
                {adminUsers.map((usr) => (
                  <div
                    key={usr.id || usr.email}
                    className="flex justify-between items-center text-xs font-semibold p-2.5 bg-neutral-900/10 dark:bg-neutral-900/40 border border-neutral-800/10 dark:border-neutral-800 rounded-lg"
                  >
                    <span>{usr.email}</span>
                    <span className="text-[9px] uppercase font-black px-2 py-0.5 bg-emerald-500/20 text-emerald-500 rounded border border-emerald-500/30">
                      {usr.role}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. INBOX TAB */}
      {activeTab === 'inquiries' && (
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-sm font-black uppercase tracking-wider ${
              isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
            }`}>
              Inquiries Inbox ({inquiries.length})
            </h3>
          </div>

          {loadingInquiries ? (
            <div className="text-center py-10 text-xs font-semibold text-neutral-500 animate-pulse">
              Reading inbox files...
            </div>
          ) : inquiries.length === 0 ? (
            <div className={`p-10 text-center rounded-3xl border ${
              isDarkMode ? 'bg-neutral-950/40 border-neutral-800' : 'bg-white border-neutral-200'
            }`}>
              <Mail className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                No visitor inquiries recorded yet
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className={`p-6 rounded-3xl border ${
                    isDarkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-4 border-b border-neutral-800/10 dark:border-neutral-800/30 pb-4">
                    <div>
                      <h4 className={`text-base font-black ${
                        isDarkMode ? 'text-white' : 'text-neutral-950'
                      }`}>
                        {inq.name}
                      </h4>
                      <span className="text-[11px] text-cyan-400 font-bold block mt-0.5">
                        {inq.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[9px] uppercase font-black text-neutral-500 tracking-wider">
                        {inq.timestamp ? new Date(inq.timestamp).toLocaleString() : 'N/A'}
                      </span>
                      <button
                        onClick={() => handleDeleteInquiry(inq.id!)}
                        className="p-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-500 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className={`text-xs font-semibold leading-relaxed whitespace-pre-line ${
                    isDarkMode ? 'text-neutral-300' : 'text-neutral-700'
                  }`}>
                    {inq.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
