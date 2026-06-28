import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Cpu, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  MapPin, 
  Bell, 
  Play, 
  TrendingUp, 
  Mic, 
  ClipboardList
} from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import bgImage from '../assets/hero_skyline_background.png';

export default function Landing() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Mouse Parallax for the 3D phone shell
  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left - width / 2) / (width / 2); // -1 to 1
    const y = (clientY - top - height / 2) / (height / 2); // -1 to 1
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50/50 text-slate-800 font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden">
      
      {/* ----------------------------------------------------------------------
          A. NAVIGATION HEADER (MOCKUP ACCURATE)
          ---------------------------------------------------------------------- */}
      <header className="w-full bg-white/70 border-b border-slate-100 sticky top-0 z-50 backdrop-blur-md px-6 py-4.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo with Brain network representation */}
          <Link to="/" className="flex items-center gap-2.5 select-none group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_4px_12px_-2px_rgba(37,99,235,0.25)] group-hover:scale-105 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="M12 6v12" />
                <path d="M8 10c0-1.5 1-2.5 2-2.5" />
                <path d="M16 10c0-1.5-1-2.5-2-2.5" />
                <path d="M12 14c1.5 0 2.5-1 2.5-2" />
                <path d="M12 14c-1.5 0-2.5-1-2.5-2" />
              </svg>
            </div>
            <div>
              <span className="font-title font-bold text-lg text-slate-900 tracking-tight">CivicMind</span>
              <span className="text-[11px] text-blue-600 font-extrabold ml-1 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100/50">AI</span>
            </div>
          </Link>

          {/* Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-semibold text-blue-600 relative py-1.5 select-none">
              Home
              <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-full" />
            </Link>
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#authorities" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">For Authorities</a>
            <a href="#about" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">About Us</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="text-xs font-bold text-slate-700 bg-slate-100/60 hover:bg-slate-100 border border-slate-200/60 hover:border-slate-350 px-4 py-2.5 rounded-full transition-all"
            >
              Login
            </Link>
            <Link
              to="/login"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs font-bold text-white px-5 py-2.5 rounded-full shadow-lg shadow-blue-500/20 flex items-center gap-1.5 hover:scale-[1.01] transition-all cursor-pointer"
            >
              Get Started <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ----------------------------------------------------------------------
          B. LIGHT HERO SECTION WITH PREMIUM PARALLAX MOCKUP
          ---------------------------------------------------------------------- */}
      <section 
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full overflow-hidden bg-gradient-to-b from-blue-50/30 via-white to-slate-50/50 pt-16 pb-28 px-6"
      >
        {/* Background Image Skyline aligned to the right */}
        <div className="absolute right-0 top-0 bottom-0 w-[55%] h-full z-0 pointer-events-none opacity-90 hidden lg:block">
          <img 
            src={bgImage} 
            alt="Futuristic Skyline" 
            className="w-full h-full object-cover object-left-bottom"
          />
          {/* Blend mask to fade out the image towards the left text */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent" />
        </div>

        {/* Soft Background Meshes */}
        <div className="absolute top-[10%] left-[-5%] w-[40%] aspect-square rounded-full bg-blue-400/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[5%] left-[25%] w-[30%] aspect-square rounded-full bg-purple-400/5 blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* LEFT SIDE: Typography */}
          <div className="lg:col-span-6 space-y-6 text-left flex flex-col justify-center">
            {/* Tag Badge */}
            <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full border border-blue-100/50">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Zero-Bureaucracy Reporting</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 font-title leading-[1.08] select-none">
              You Report.<br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
                AI Thinks.
              </span><br />
              Communities Improve.
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-slate-500 max-w-lg leading-relaxed font-medium">
              Report community issues in under 10 seconds. Our AI handles the paperwork, so you don't have to.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <Link to="/login" className="w-full sm:w-auto">
                <Button 
                  variant="primary" 
                  size="lg" 
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 text-white font-extrabold px-8 py-3.5 rounded-full shadow-lg shadow-blue-500/25 hover:scale-[1.02] transition-transform flex items-center justify-center gap-1.5"
                >
                  Get Started — It's Free <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <a href="#watch-demo" className="w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto bg-white border border-slate-200/80 text-slate-700 font-bold px-6 py-3.5 rounded-full shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <Play className="w-2.5 h-2.5 fill-current" />
                  </div>
                  Watch Demo
                </Button>
              </a>
            </div>

            {/* Trust indicator */}
            <div className="flex items-center gap-3 pt-4">
              <div className="flex -space-x-3.5">
                {[
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=faces&q=80",
                  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=faces&q=80",
                  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces&q=80",
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=faces&q=80"
                ].map((avatar, idx) => (
                  <div 
                    key={idx}
                    className="w-8.5 h-8.5 rounded-full border-2 border-white overflow-hidden shadow-sm select-none"
                  >
                    <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
                  </div>
                ))}
                <div className="w-9 h-8.5 rounded-full bg-blue-50 border-2 border-white text-blue-600 flex items-center justify-center text-[10px] font-bold shadow-sm">
                  12K+
                </div>
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Active citizens building better communities
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Obsidian 3D Phone & Holographic Base */}
          <div className="lg:col-span-6 relative flex justify-center items-center h-[540px]">
            {/* Holographic Glowing Base Ring Platform */}
            <div className="absolute w-[360px] h-[360px] top-[55%] z-0 pointer-events-none flex items-center justify-center opacity-70">
              <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" className="filter blur-[0.5px]">
                <circle cx="50" cy="50" r="44" stroke="url(#holographic-base)" strokeWidth="0.8" strokeDasharray="3 4" />
                <circle cx="50" cy="50" r="38" stroke="url(#holographic-base)" strokeWidth="0.5" strokeDasharray="10 2" />
                <defs>
                  <linearGradient id="holographic-base" x1="0" y1="0" x2="100" y2="100">
                    <stop stopColor="#3b82f6" />
                    <stop offset="0.5" stopColor="#a855f7" />
                    <stop offset="1" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Glowing Drop Shadow Behind Phone */}
            <div className="absolute w-[180px] h-[380px] bg-blue-500/15 rounded-full blur-[80px] z-0 pointer-events-none" />

            {/* 3D Phone Container */}
            <motion.div
              style={{
                transformStyle: "preserve-3d",
                perspective: 1000,
              }}
              animate={{
                y: [0, -12, 0],
                rotateX: 10 + (mousePos.y * -12),
                rotateY: -14 + (mousePos.x * 14),
                rotateZ: 2
              }}
              transition={{
                y: { repeat: Infinity, duration: 6, ease: "easeInOut" },
                rotateX: { type: "spring", stiffness: 70, damping: 22 },
                rotateY: { type: "spring", stiffness: 70, damping: 22 }
              }}
              className="relative w-[235px] h-[470px] bg-slate-900 border-[7px] border-slate-800 rounded-[36px] shadow-[0_20px_50px_-10px_rgba(15,23,42,0.25)] overflow-hidden z-10 flex flex-col"
            >
              {/* Reflected Glass Sheen Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 z-20 pointer-events-none" />

              {/* Speaker & Dynamic Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4.5 bg-black rounded-full z-30 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mr-8 animate-pulse" />
                <span className="w-1 h-1 rounded-full bg-slate-900" />
              </div>

              {/* Citizen UI Layout */}
              <div className="flex-1 bg-slate-950 p-4 pt-10 flex flex-col justify-between text-left font-sans select-none">
                {/* User Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden border border-white/10">
                      R
                    </div>
                    <div>
                      <p className="text-[7px] text-slate-500 font-bold uppercase leading-none">Good Morning,</p>
                      <h4 className="text-[10px] font-bold text-slate-200 leading-none mt-1">Ravi Kumar 👋</h4>
                    </div>
                  </div>
                  <button className="w-6 h-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400">
                    <Bell className="w-3 h-3" />
                  </button>
                </div>

                {/* Camera Pulse Scan Center */}
                <div className="my-4 flex-1 rounded-2xl bg-slate-900/40 border border-white/5 overflow-hidden p-3 flex flex-col justify-between items-center relative text-center">
                  <div>
                    <h5 className="text-[10px] font-black text-white">Quick Report</h5>
                    <p className="text-[7px] text-slate-500 mt-0.5">Tap to report an issue</p>
                  </div>

                  {/* Pulsing Button Platform */}
                  <div className="relative w-22 h-22 flex items-center justify-center cursor-pointer">
                    <div className="absolute inset-0 rounded-full border border-blue-500/20 animate-ping opacity-60" />
                    <div className="absolute w-18 h-18 rounded-full border border-blue-500/30 animate-pulse flex items-center justify-center">
                      <div className="absolute w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-white">
                        <Camera className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  <div className="w-full grid grid-cols-2 gap-2 mt-2">
                    <button className="py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 font-semibold text-[8px] flex items-center justify-center gap-1">
                      <Mic className="w-2.5 h-2.5 text-blue-400" /> Voice Note
                    </button>
                    <button className="py-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-300 font-semibold text-[8px] flex items-center justify-center gap-1">
                      <ClipboardList className="w-2.5 h-2.5 text-indigo-400" /> My Reports
                    </button>
                  </div>
                </div>

                {/* Nearby Active Issues List */}
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <div className="flex justify-between items-center text-[7px] font-bold text-slate-500 uppercase tracking-wide">
                    <span>Nearby Issues</span>
                    <span className="text-blue-400 font-bold hover:underline cursor-pointer">View all</span>
                  </div>
                  
                  <div className="flex items-center justify-between bg-slate-900/60 border border-white/5 p-2 rounded-lg gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-rose-500/20 text-rose-400 flex items-center justify-center text-[8px] font-bold">
                        ▲
                      </div>
                      <div className="text-left">
                        <h6 className="text-[8px] font-bold text-slate-350">Pothole on Park Ave</h6>
                        <span className="text-[6px] text-rose-400 font-bold">High Priority</span>
                      </div>
                    </div>
                    <span className="text-[6px] font-mono text-slate-500">120m away</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Floating Glass Statistic Cards (Mockup accurate layout) */}
            {/* Card 1 */}
            <motion.div
              style={{ transformStyle: "preserve-3d" }}
              animate={{ y: [0, -9, 0] }}
              transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut", delay: 0.2 }}
              className="absolute top-12 right-[-20px] sm:right-0 z-20 bg-white/95 border border-slate-100/90 rounded-2xl p-3.5 shadow-[0_15px_30px_rgba(15,23,42,0.06)] text-left min-w-[160px] flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/30">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-black tracking-tight text-slate-900 leading-none">12.4K+</h4>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">Issues Reported</p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              style={{ transformStyle: "preserve-3d" }}
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 5.2, ease: "easeInOut", delay: 0.6 }}
              className="absolute top-[175px] right-[-30px] sm:right-[-10px] z-20 bg-white/95 border border-slate-100/90 rounded-2xl p-3.5 shadow-[0_15px_30px_rgba(15,23,42,0.06)] text-left min-w-[160px] flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/30">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div>
                <h4 className="text-sm font-black tracking-tight text-slate-900 leading-none">8.7K+</h4>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">Resolved</p>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              style={{ transformStyle: "preserve-3d" }}
              animate={{ y: [0, -7, 0] }}
              transition={{ repeat: Infinity, duration: 4.4, ease: "easeInOut", delay: 1.1 }}
              className="absolute bottom-[100px] right-[-20px] sm:right-[-5px] z-20 bg-white/95 border border-slate-100/90 rounded-2xl p-3.5 shadow-[0_15px_30px_rgba(15,23,42,0.06)] text-left min-w-[160px] flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/30">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-sm font-black tracking-tight text-slate-900 leading-none">2.1K+</h4>
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mt-1">Active Citizens</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------
          C. "HOW IT WORKS" VISUAL JOURNEY SECTION (MOCKUP ACCURATE)
          ---------------------------------------------------------------------- */}
      <section id="how-it-works" className="relative w-full py-24 px-6 bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-14">
          
          {/* Section Header */}
          <div className="text-center space-y-2">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100/50">
              HOW IT WORKS
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 font-title">
              Three <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 font-black">simple</span> steps
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              No complicated forms. We simplified the reporting process.
            </p>
          </div>

          {/* Connected Cards */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
            
            {/* Wavy Connected Arrow 1 (Desktop) */}
            <div className="hidden md:block absolute top-[52px] left-[26%] right-[54%] h-4 z-0 pointer-events-none">
              <svg width="100%" height="24" viewBox="0 0 200 24" fill="none" className="overflow-visible w-full">
                <path
                  d="M0 10 Q 50 -10 100 10 T 200 10"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  strokeLinecap="round"
                  fill="none"
                  className="opacity-40"
                />
                <polygon points="198,10 190,5 190,15" fill="#3b82f6" className="opacity-40" />
              </svg>
            </div>

            {/* Wavy Connected Arrow 2 (Desktop) */}
            <div className="hidden md:block absolute top-[52px] left-[59%] right-[21%] h-4 z-0 pointer-events-none">
              <svg width="100%" height="24" viewBox="0 0 200 24" fill="none" className="overflow-visible w-full">
                <path
                  d="M0 10 Q 50 -10 100 10 T 200 10"
                  stroke="#3b82f6"
                  strokeWidth="2"
                  strokeDasharray="5 5"
                  strokeLinecap="round"
                  fill="none"
                  className="opacity-40"
                />
                <polygon points="198,10 190,5 190,15" fill="#3b82f6" className="opacity-40" />
              </svg>
            </div>

            {/* Step 1 Card */}
            <div className="relative z-10 text-left">
              {/* Badge Number */}
              <div className="absolute top-[-14px] left-8 w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-extrabold shadow-md shadow-blue-500/20">
                1
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.03)] flex items-center gap-5 pt-8">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/30 shrink-0 shadow-sm">
                  <Camera className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm font-title">Take a Photo</h4>
                  <p className="text-[11px] leading-relaxed text-slate-500 mt-1">Snap a picture of the issue directly from your phone</p>
                </div>
              </div>
            </div>

            {/* Step 2 Card */}
            <div className="relative z-10 text-left">
              {/* Badge Number */}
              <div className="absolute top-[-14px] left-8 w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-extrabold shadow-md shadow-indigo-500/20">
                2
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.03)] flex items-center gap-5 pt-8">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100/30 shrink-0 shadow-sm">
                  <Cpu className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm font-title">AI Understands</h4>
                  <p className="text-[11px] leading-relaxed text-slate-500 mt-1">Our AI automatically detects the category, severity and location</p>
                </div>
              </div>
            </div>

            {/* Step 3 Card */}
            <div className="relative z-10 text-left">
              {/* Badge Number */}
              <div className="absolute top-[-14px] left-8 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-extrabold shadow-md shadow-emerald-500/20">
                3
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.03)] flex items-center gap-5 pt-8">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/30 shrink-0 shadow-sm">
                  <Activity className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm font-title">Track Resolution</h4>
                  <p className="text-[11px] leading-relaxed text-slate-500 mt-1">Watch real-time updates as authorities resolve the issue</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------
          D. BOTTOM GRID FEATURE BAR (MOCKUP ACCURATE)
          ---------------------------------------------------------------------- */}
      <section id="features" className="relative w-full py-24 px-6 bg-slate-50/50 overflow-hidden">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Section Header */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-title">
              Designed for a better tomorrow
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium tracking-wide">
              Empowering citizens. Enabling smarter governance.
            </p>
          </div>

          {/* Grid Container styled with grid patterns */}
          <div className="bg-white/80 border border-slate-100 rounded-[24px] shadow-[0_15px_40px_rgba(15,23,42,0.02)] p-8 relative overflow-hidden">
            {/* Grid dot overlay pattern */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
              backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
              backgroundSize: "20px 20px"
            }} />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:divide-x md:divide-slate-100 relative z-10 text-left">
              
              {/* Feature 1 */}
              <div className="space-y-3 p-2 md:px-6">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/20 shrink-0">
                  <Zap className="w-4.5 h-4.5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base font-title">Instant Routing</h4>
                <p className="text-[11px] leading-relaxed text-slate-500 font-medium">AI assigns to the right department instantly</p>
              </div>

              {/* Feature 2 */}
              <div className="space-y-3 p-2 md:px-8">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/20 shrink-0">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base font-title">Duplicate Alert</h4>
                <p className="text-[11px] leading-relaxed text-slate-500 font-medium">Avoids duplicates and keeps data clean</p>
              </div>

              {/* Feature 3 */}
              <div className="space-y-3 p-2 md:px-8">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/20 shrink-0">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base font-title">Accessibility First</h4>
                <p className="text-[11px] leading-relaxed text-slate-500 font-medium">Voice input, large icons and regional support</p>
              </div>

              {/* Feature 4 */}
              <div className="space-y-3 p-2 md:px-8">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/20 shrink-0">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-base font-title">Geo-Tracking</h4>
                <p className="text-[11px] leading-relaxed text-slate-500 font-medium">GPS tagging for precise location tracking</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------------------------
          E. PREMIUM MINIMAL FOOTER
          ---------------------------------------------------------------------- */}
      <footer className="w-full bg-slate-900 text-slate-400 py-14 px-6 text-center border-t border-slate-950 relative z-20">
        <div className="max-w-7xl mx-auto space-y-5">
          <div className="flex justify-center items-center gap-2 select-none">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              C
            </div>
            <span className="font-title font-bold text-sm text-white">CivicMind</span>
            <span className="text-[8px] text-slate-350 font-bold ml-1 bg-white/10 px-1 py-0.5 rounded border border-white/5">AI</span>
          </div>
          
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 max-w-md mx-auto">
            CivicMind AI © 2026. Made with Google Gemini. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
