import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Mail, 
  Key, 
  Sparkles, 
  LogIn, 
  Chrome, 
  ArrowRight, 
  BookOpen, 
  UserPlus, 
  ShieldCheck 
} from 'lucide-react';

interface AdminLoginProps {
  isDarkMode: boolean;
  onLoginSuccess: () => void;
}

export default function AdminLogin({ isDarkMode, onLoginSuccess }: AdminLoginProps) {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  // Handle Google Sign In / Registration
  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const loggedUser = result.user;

      // Verify or register the user in the database
      const userDocRef = doc(db, 'users', loggedUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userRole = 'user';
      if (userDoc.exists()) {
        userRole = userDoc.data().role || 'user';
      } else {
        // Create user document with default role 'user'
        userRole = loggedUser.email === 'omrishi2580@gmail.com' ? 'admin' : 'user';
        await setDoc(userDocRef, {
          email: loggedUser.email,
          role: userRole,
          createdAt: new Date().toISOString()
        }, { merge: true });
      }

      // Allow access if they are lead developer or designated admin
      if (loggedUser.email === 'omrishi2580@gmail.com' || userRole === 'admin') {
        onLoginSuccess();
      } else {
        // Instantly sign out unauthorized accounts
        await auth.signOut();
        setErrorMsg(`Access Denied: The Google account ${loggedUser.email} has been registered as a normal user. Ask the system administrator to change your role to "admin" inside the 'users' database.`);
      }
    } catch (error: any) {
      console.error('Google Auth Error:', error);
      setErrorMsg(error.message || 'Google Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Email/Password Registration
  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Both fields are required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const loggedUser = result.user;

      const isLeadAdmin = loggedUser.email === 'omrishi2580@gmail.com';
      const defaultRole = isLeadAdmin ? 'admin' : 'user';

      // Record the user inside the Firestore database with default role 'user'
      await setDoc(doc(db, 'users', loggedUser.uid), {
        email: loggedUser.email,
        role: defaultRole,
        createdAt: new Date().toISOString()
      }, { merge: true });

      if (isLeadAdmin) {
        onLoginSuccess();
      } else {
        // Sign out newly registered normal user
        await auth.signOut();
        setSuccessMsg(`Account created successfully! The user ${loggedUser.email} has been registered as a "normal user" in the database. To access the Admin Panel, please change their role to "admin" inside the Firestore 'users' collection.`);
        // Switch back to sign-in mode for clean flow
        setAuthMode('signin');
        setEmail('');
        setPassword('');
      }
    } catch (error: any) {
      console.error('Email Registration Error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setErrorMsg('This email is already registered. Please sign in instead.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMsg('The password must be at least 6 characters long.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setErrorMsg('Email registration is not yet enabled in your Firebase console.');
      } else {
        setErrorMsg(error.message || 'Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Email/Password Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Both fields are required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const loggedUser = result.user;

      // Verify database role document
      const userDocRef = doc(db, 'users', loggedUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      let userRole = 'user';
      if (userDoc.exists()) {
        userRole = userDoc.data().role || 'user';
      } else {
        // Auto-heal the user document in database
        userRole = loggedUser.email === 'omrishi2580@gmail.com' ? 'admin' : 'user';
        await setDoc(userDocRef, {
          email: loggedUser.email,
          role: userRole,
          createdAt: new Date().toISOString()
        }, { merge: true });
      }

      // Check privileges
      if (loggedUser.email === 'omrishi2580@gmail.com' || userRole === 'admin') {
        onLoginSuccess();
      } else {
        // Sign out unauthorized users immediately
        await auth.signOut();
        setErrorMsg(`Access Denied: The account ${loggedUser.email} has been registered as a normal user. Ask the system administrator to change your role to "admin" inside your 'users' collection.`);
      }
    } catch (error: any) {
      console.error('Email Auth Error:', error);
      if (error.code === 'auth/auth-domain-config-not-provided' || error.code === 'auth/configuration-not-found') {
        setErrorMsg('Email/Password provider is not yet enabled in the Firebase Console. Use "Login with Google" for instant pre-configured access, or click "Firebase Help Guide" below.');
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setErrorMsg('Invalid email or password.');
      } else {
        setErrorMsg(error.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md relative">
        
        {/* Glow behind */}
        <div className={`absolute -inset-1 rounded-3xl filter blur-xl opacity-30 ${
          isDarkMode ? 'bg-cyan-500' : 'bg-indigo-500'
        }`} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-8 rounded-3xl border backdrop-blur-md relative z-10 ${
            isDarkMode 
              ? 'bg-neutral-950/70 border-neutral-800 shadow-2xl' 
              : 'bg-white/70 border-neutral-200 shadow-lg'
          }`}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className={`p-3 rounded-2xl w-fit mx-auto mb-4 ${
              isDarkMode ? 'bg-neutral-900 text-cyan-400' : 'bg-neutral-100 text-indigo-600'
            }`}>
              {authMode === 'signin' ? <Lock className="w-6 h-6" /> : <UserPlus className="w-6 h-6 text-purple-400" />}
            </div>
            
            <h2 className={`text-2xl font-extrabold tracking-tight ${
              isDarkMode ? 'text-white' : 'text-neutral-900'
            }`}>
              {authMode === 'signin' ? 'Admin Gateway' : 'Create Account'}
            </h2>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              {authMode === 'signin' 
                ? 'Authorized credentials unlock total system command controls' 
                : 'Anyone can register. Elevate your role from the Firestore dashboard.'}
            </p>

            {/* Authentication Tabs */}
            <div className="flex p-1 rounded-xl border max-w-xs mx-auto bg-neutral-100/50 dark:bg-neutral-900/60 border-neutral-200 dark:border-neutral-800/80 mt-5">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signin');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-white dark:bg-neutral-850 text-purple-500 dark:text-cyan-400 shadow-sm scale-[1.02]'
                    : 'text-neutral-500 hover:text-neutral-850 dark:hover:text-neutral-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white dark:bg-neutral-850 text-purple-500 dark:text-cyan-400 shadow-sm scale-[1.02]'
                    : 'text-neutral-500 hover:text-neutral-850 dark:hover:text-neutral-200'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 mb-5 text-xs font-semibold rounded bg-red-500/10 border border-red-500/20 text-red-400 leading-relaxed"
              >
                {errorMsg}
              </motion.div>
            )}

            {successMsg && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 mb-5 text-xs font-semibold rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 leading-relaxed space-y-1"
              >
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-bold">Database Saved</span>
                </div>
                <p>{successMsg}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={authMode === 'signin' ? handleEmailLogin : handleEmailRegister} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold uppercase mb-1.5 ${
                isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
              }`}>
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 text-sm font-medium rounded-xl border outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-neutral-900/40 border-neutral-800 text-white focus:border-cyan-500 focus:bg-neutral-900/80' 
                      : 'bg-white/50 border-neutral-200 text-neutral-900 focus:border-indigo-600 focus:bg-white'
                  }`}
                  placeholder="name@domain.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-bold uppercase mb-1.5 ${
                isDarkMode ? 'text-neutral-400' : 'text-neutral-600'
              }`}>
                Security Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-500">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-9 pr-4 py-2.5 text-sm font-medium rounded-xl border outline-none transition-all ${
                    isDarkMode 
                      ? 'bg-neutral-900/40 border-neutral-800 text-white focus:border-cyan-500 focus:bg-neutral-900/80' 
                      : 'bg-white/50 border-neutral-200 text-neutral-900 focus:border-indigo-600 focus:bg-white'
                  }`}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center space-x-2 border cursor-pointer ${
                authMode === 'signin'
                  ? isDarkMode 
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-neutral-950 border-cyan-400' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
                  : isDarkMode 
                    ? 'bg-purple-500 hover:bg-purple-400 text-white border-purple-400' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500'
              } disabled:opacity-50`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-t-transparent border-neutral-950 dark:border-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{authMode === 'signin' ? 'Sign In with Password' : 'Create Free Account'}</span>
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${isDarkMode ? 'border-neutral-800' : 'border-neutral-200'}`} />
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold">
              <span className={`px-3 backdrop-blur-md ${isDarkMode ? 'text-neutral-500 bg-neutral-950/20' : 'text-neutral-400 bg-white/20'}`}>
                Or Google Authentication
              </span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center space-x-2 border cursor-pointer ${
              isDarkMode 
                ? 'bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800' 
                : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50 shadow-sm'
            } disabled:opacity-50`}
          >
            <Chrome className="w-4 h-4 text-red-500" />
            <span>{authMode === 'signin' ? 'Login with Google' : 'Sign Up with Google'}</span>
          </button>

          {/* Quick Info / Config Help Accordion */}
          <div className="mt-8 pt-4 border-t border-neutral-800/20 text-center">
            <button
              type="button"
              onClick={() => setShowConfigGuide(!showConfigGuide)}
              className="text-xs font-semibold text-cyan-500 dark:text-cyan-400 inline-flex items-center gap-1 hover:underline"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {showConfigGuide ? 'Hide Firebase Setup Help' : 'Firebase Integration Guide'}
            </button>

            {showConfigGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className={`text-left text-[11px] p-4 mt-3 rounded-xl leading-relaxed space-y-2 border ${
                  isDarkMode 
                    ? 'bg-neutral-900/60 border-neutral-800 text-neutral-400' 
                    : 'bg-neutral-50 border-neutral-200 text-neutral-600'
                }`}
              >
                <p className="font-bold text-neutral-900 dark:text-neutral-100">Getting Access Instantly:</p>
                <p>1. <strong>Google Sign-In:</strong> Log in using the Google Account associated with your developer email: <code>omrishi2580@gmail.com</code>. It works immediately out of the box because Google OAuth was preconfigured by the system setup!</p>
                <p>2. <strong>Email/Password:</strong> To authorize custom logins, go to your Firebase Console under Authentication → Sign-in Method, and enable <strong>Email/Password</strong>. You can then register your admin credentials safely.</p>
              </motion.div>
            )}
          </div>

        </motion.div>
      </div>
    </div>
  );
}
