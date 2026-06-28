import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Button from '../components/Button';
import bgImage from '../assets/hero_skyline_background.png';

export default function Login() {
  const { loginWithGoogle, loginDeveloperMock, error, clearError } = useAuth();
  
  const [selectedRole, setSelectedRole] = useState('citizen'); // 'citizen' or 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState(null);

  const handleGoogleLogin = async () => {
    clearError();
    setLocalError(null);
    try {
      await loginWithGoogle(selectedRole);
    } catch (err) {
      // Handled by AuthContext state
    }
  };

  const handleEmailPasswordLogin = async (e) => {
    e.preventDefault();
    clearError();
    setLocalError(null);

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    try {
      if (selectedRole === 'admin') {
        // Admin credentials mock bypass
        await loginDeveloperMock('admin');
      } else {
        // Citizen credentials mock bypass, using name from email
        const displayUsername = email.split('@')[0];
        const formattedName = displayUsername.charAt(0).toUpperCase() + displayUsername.slice(1);
        await loginDeveloperMock('citizen', formattedName);
      }
    } catch (err) {
      setLocalError('Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#05070f] text-white flex flex-col lg:flex-row relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Dynamic Star Dust Particles */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-25">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-400/20 blur-[0.5px]"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.6, 0.1],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* ----------------------------------------------------------------------
          LEFT SIDE: WELCOME PANEL (MOCKUP ACCURATE WITH SKYLINE GRADIENT COLOR GRADING)
          ---------------------------------------------------------------------- */}
      <div className="lg:w-1/2 flex flex-col justify-between p-8 sm:p-12 z-10 relative">
        
        {/* Futuristic Skyline Background Image aligned with color grading */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-45 mix-blend-screen">
          <img 
            src={bgImage} 
            alt="Futuristic Skyline" 
            className="w-full h-full object-cover object-bottom"
          />
          {/* Custom vignette to keep text highly legible */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#05070f] via-[#090e24]/75 to-[#05070f]/90" />
        </div>

        {/* Glowing Gradient Mesh Circles */}
        <div className="absolute top-[10%] left-[-10%] w-[60%] aspect-square rounded-full bg-gradient-to-tr from-blue-600/15 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[5%] right-[-5%] w-[55%] aspect-square rounded-full bg-gradient-to-br from-purple-600/15 to-transparent blur-[110px] pointer-events-none" />

        {/* Top Header Logo */}
        <div className="flex items-center gap-2.5 select-none self-start relative z-10">
          <div className="w-8 h-8 rounded-lg bg-primary-blue flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(37,99,235,0.4)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4.5 h-4.5">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              <path d="M12 6v12" />
              <path d="M8 10c0-1.5 1-2.5 2-2.5" />
              <path d="M16 10c0-1.5-1-2.5-2-2.5" />
              <path d="M12 14c1.5 0 2.5-1 2.5-2" />
              <path d="M12 14c-1.5 0-2.5-1-2.5-2" />
            </svg>
          </div>
          <div>
            <span className="font-title font-bold text-base text-white tracking-tight">CivicMind</span>
            <span className="text-[10px] text-white font-bold ml-1 bg-white/10 px-1.5 py-0.5 rounded border border-white/10">AI</span>
          </div>
        </div>

        {/* Typography Content */}
        <div className="space-y-6 my-auto pt-12 max-w-lg text-left relative z-10">
          <h1 className="text-4xl sm:text-5xl font-black font-title tracking-tight leading-[1.1] select-none text-slate-100 animate-fade-in">
            Welcome to <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              CivicMind AI
            </span>
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed font-semibold">
            Report community issues in under 10 seconds. AI handles the bureaucracy.
          </p>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {[
              { label: 'Fast Reporting', icon: Zap, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
              { label: 'Secure & Safe', icon: ShieldCheck, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
              { label: 'AI Powered', icon: Sparkles, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' }
            ].map((tag, idx) => {
              const TagIcon = tag.icon;
              return (
                <div key={idx} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold ${tag.color}`}>
                  <TagIcon className="w-3.5 h-3.5" />
                  {tag.label}
                </div>
              );
            })}
          </div>

          {/* Phone Mockup Layout */}
          <div className="relative flex justify-center items-center h-[340px] pt-8 z-10">
            
            {/* Holographic Ring Base */}
            <motion.div 
              className="absolute w-[280px] h-[280px] top-[40%] pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
            >
              <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className="opacity-25">
                <circle cx="50" cy="50" r="44" stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="3 4" />
                <circle cx="50" cy="50" r="38" stroke="#a855f7" strokeWidth="0.5" strokeDasharray="8 2" />
              </svg>
            </motion.div>

            {/* Glowing Ring Core */}
            <div className="absolute w-[120px] h-[220px] bg-blue-500/10 rounded-full blur-[60px]" />

            {/* Obsidian smartphone mockup with lock */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="relative w-[155px] h-[290px] bg-slate-900 border-[5px] border-slate-800 rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.6)] overflow-hidden z-10 flex flex-col justify-between p-3.5 pt-7 text-center"
            >
              {/* Dynamic island notch */}
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-14 h-3 bg-black rounded-full z-30" />

              <div className="flex-1 flex flex-col justify-center items-center gap-4">
                {/* Glowing Blue Circle Lock */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping opacity-60" />
                  <div className="absolute w-13 h-13 rounded-full border border-blue-500/30 flex items-center justify-center bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 text-blue-400">
                    <Lock className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-black text-white tracking-wide font-title leading-tight">Secure Sign In</h4>
                  <p className="text-[7px] text-slate-500 font-bold uppercase mt-1">Protected by Google</p>
                </div>
              </div>

              {/* Mini Google Logo inside Phone */}
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-white">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
            </motion.div>

            {/* Floating stats cards */}
            {/* Stats Card 1 */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4.6, ease: "easeInOut", delay: 0.2 }}
              className="absolute top-8 left-[-15px] sm:left-4 z-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-2 shadow-2xl text-left min-w-[105px] flex items-center gap-2"
            >
              <div className="w-5.5 h-5.5 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center text-[10px] font-bold">
                👥
              </div>
              <div>
                <h5 className="text-[11px] font-black text-white">12.4K+</h5>
                <p className="text-[6px] font-bold text-slate-400 uppercase leading-none mt-0.5">Issues Reported</p>
              </div>
            </motion.div>

            {/* Stats Card 2 */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 5.0, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-[135px] right-[-20px] sm:right-6 z-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-2 shadow-2xl text-left min-w-[100px] flex items-center gap-2"
            >
              <div className="w-5.5 h-5.5 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                ✓
              </div>
              <div>
                <h5 className="text-[11px] font-black text-white">8.7K+</h5>
                <p className="text-[6px] font-bold text-slate-400 uppercase leading-none mt-0.5">Resolved</p>
              </div>
            </motion.div>

            {/* Stats Card 3 */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut", delay: 1.0 }}
              className="absolute bottom-[35px] left-[-5px] sm:left-10 z-20 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-2 shadow-2xl text-left min-w-[105px] flex items-center gap-2"
            >
              <div className="w-5.5 h-5.5 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[10px] font-bold">
                <TrendingUp className="w-3 h-3" />
              </div>
              <div>
                <h5 className="text-[11px] font-black text-white">2.1K+</h5>
                <p className="text-[6px] font-bold text-slate-400 uppercase leading-none mt-0.5">Active Citizens</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Footer info left */}
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-650 text-left pt-6 border-t border-slate-900/60 relative z-10">
          CivicMind AI © 2026. Made with Google Gemini.
        </div>
      </div>

      {/* ----------------------------------------------------------------------
          RIGHT SIDE: PREMIUM CARD LOGIN (MOCKUP ACCURATE)
          ---------------------------------------------------------------------- */}
      <div className="lg:w-1/2 bg-[#090b14]/30 backdrop-blur-sm flex items-center justify-center py-14 px-6 z-10 relative">
        <div className="absolute top-[-20%] right-[-10%] w-[60%] aspect-square rounded-full bg-gradient-to-tr from-blue-500/5 to-transparent blur-[130px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-xl animate-fade-in"
        >
          {/* Main White Login Card */}
          <div className="bg-white rounded-[32px] p-8 sm:p-10 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] text-slate-800 space-y-6">
            
            {/* Top C Letter Circle icon */}
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-extrabold text-2xl font-title shadow-sm shadow-blue-500/5 select-none animate-pulse">
                C
              </div>
            </div>

            {/* Headlines (Mockup matching) */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-title">
                Welcome to <span className="text-blue-600 font-black">CivicMind AI</span>
              </h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                Report community issues in under 10 seconds. AI handles the bureaucracy. Sign in using your Google credentials.
              </p>
            </div>

            {/* Error Banners */}
            {(error || localError) && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-left relative z-20">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs text-red-800">Authentication Error</h4>
                  <p className="text-[10px] text-red-600 mt-0.5 leading-relaxed">{error || localError}</p>
                </div>
              </div>
            )}

            {/* Role Switcher Pill (Citizen Access vs Admin Access) */}
            <div className="space-y-2 text-left">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Select Access Portal</span>
              <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => { setSelectedRole('citizen'); setLocalError(null); }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                    selectedRole === 'citizen'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Citizen Access
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedRole('admin'); setLocalError(null); }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
                    selectedRole === 'admin'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Admin Portal
                </button>
              </div>
            </div>

            {/* 1. GOOGLE LOGIN WITH REAL GOOGLE LOGO */}
            <div className="pt-2">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-slate-200/80 text-slate-700 bg-white hover:bg-slate-50 shadow-sm rounded-xl font-bold flex items-center justify-center gap-2 min-h-[48px] cursor-pointer transition-all hover:scale-[1.01]"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign In with Google
              </Button>
            </div>

            {/* Divider OR */}
            <div className="relative my-3 flex items-center select-none">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-[9px] text-slate-400 font-black uppercase tracking-wider">OR</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            {/* 2. EMAIL & PASSWORD LOGIN FORM */}
            <form onSubmit={handleEmailPasswordLogin} className="space-y-4 text-left">
              <div>
                <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. name@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-4.5 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900 bg-slate-50/50"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black uppercase tracking-wider text-slate-400">Security Password</label>
                  <button
                    type="button"
                    onClick={() => { setShowPassword(!showPassword); }}
                    className="text-[9px] font-bold text-blue-500 hover:text-blue-700 cursor-pointer select-none"
                  >
                    {showPassword ? 'Hide Password' : 'Show Password'}
                  </button>
                </div>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4.5 py-3 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-900 bg-slate-50/50 pr-10"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold shadow-md shadow-blue-500/15 py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:scale-[1.01] transition-transform select-none cursor-pointer"
              >
                Sign In as {selectedRole === 'admin' ? 'Admin' : 'Citizen'} <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </form>

            {/* Bottom Shield Info */}
            <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1.5 pt-2 select-none border-t border-slate-100 pt-4">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Your data is protected and encrypted</span>
            </div>

          </div>
        </motion.div>
      </div>

    </div>
  );
}
