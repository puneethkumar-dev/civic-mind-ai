import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Cpu, Activity, ArrowRight, ShieldCheck, Zap, Sparkles, MapPin } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

export default function Landing() {
  const steps = [
    {
      num: '01',
      title: 'Take Photo',
      desc: 'Snap a picture of the issue (pothole, leak, etc.) directly on your phone.',
      icon: Camera,
      color: 'bg-primary-blue/10 text-primary-blue border-primary-blue/20',
    },
    {
      num: '02',
      title: 'AI Understands',
      desc: 'Our Gemini AI automatically detects the category, severity, and location.',
      icon: Cpu,
      color: 'bg-amber-100/60 text-amber-600 border-amber-200/50',
    },
    {
      num: '03',
      title: 'Track Resolution',
      desc: 'Watch the timeline update in real-time as officials fix the problem.',
      icon: Activity,
      color: 'bg-emerald-100/60 text-emerald-600 border-emerald-200/50',
    },
  ];

  const features = [
    { title: 'Instant Routing', desc: 'No category lists. AI assigns reports to the correct municipal division instantly.', icon: Zap },
    { title: 'Duplicate Alert', desc: 'If a neighbor already reported a problem, join forces instead of sending duplicate reports.', icon: ShieldCheck },
    { title: 'Accessibility First', desc: 'Voice input and large icons make reporting accessible for users of all ages.', icon: Sparkles },
    { title: 'Geo-Tracking', desc: 'No address typing. GPS coordinates map the problem automatically.', icon: MapPin },
  ];

  return (
    <div className="flex-1 flex flex-col items-center py-6 md:py-12 overflow-hidden">
      {/* Decorative gradient blur */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-gradient-to-b from-blue-500/5 to-transparent rounded-full blur-3xl -z-10" />

      {/* Hero Section */}
      <div className="w-full text-center max-w-3xl mx-auto space-y-6 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-light text-primary-blue text-xs font-bold rounded-full border border-primary-blue/15"
        >
          <Sparkles className="w-3.5 h-3.5 fill-current text-primary-blue animate-pulse" />
          Zero-Bureaucracy Reporting
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-tight font-title"
        >
          CivicMind <span className="text-primary-blue bg-clip-text">AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed"
        >
          Report community issues in under 10 seconds. AI handles the bureaucracy.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <Link to="/login">
            <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-lg group">
              Get Started
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <a href="#how-it-works" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              How it Works
            </Button>
          </a>
        </motion.div>
      </div>

      {/* Hero Mockup Panel */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full max-w-4xl mt-16 px-4"
      >
        <div className="bg-white rounded-3xl p-3 sm:p-5 border border-slate-100 shadow-2xl relative">
          <div className="flex items-center gap-1.5 pb-3 sm:pb-4 border-b border-slate-50 px-2">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider ml-3">CivicMind System Simulator</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-4">
            <div className="md:col-span-4 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-8 h-8 rounded-lg bg-primary-blue text-white flex items-center justify-center font-bold text-sm">C</div>
                <h4 className="font-bold text-slate-800 text-sm">Community Update</h4>
                <p className="text-xs text-slate-500 leading-relaxed">AI processed a reported pothole on Park Ave. Assigned to Road Maintenance division.</p>
              </div>
              <div className="mt-8 pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">R</div>
                <div>
                  <p className="text-[10px] font-bold text-slate-700">Ravi K.</p>
                  <p className="text-[9px] text-slate-400">Citizen Reporter</p>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-8 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Interactive Timeline</span>
                <span className="text-[10px] font-bold text-success-green px-2 py-0.5 bg-success-light rounded-full border border-success-green/10">In Progress</span>
              </div>
              <div className="space-y-3.5">
                {[
                  { text: 'Issue Reported by citizen ( लक्ष्मी प्रसाद ) via speech description.', done: true },
                  { text: 'Gemini AI automatically localized GPS & categorized as Water Leak.', done: true },
                  { text: 'Ticket dispatched to Water & Sanitation Department.', done: true },
                  { text: 'Inspection team dispatched (Assigned Officer: Arjun M.).', done: false },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className={`w-4 h-4 rounded-full mt-0.5 flex items-center justify-center shrink-0 text-[8px] font-bold ${step.done ? 'bg-primary-blue text-white' : 'bg-slate-200 text-slate-400'}`}>
                      {step.done ? '✓' : idx + 1}
                    </div>
                    <p className={`text-xs ${step.done ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* How it Works Section */}
      <div id="how-it-works" className="w-full max-w-5xl mt-24 px-4 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-title">How CivicMind Works</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">No complicated forms. We simplified the reporting sequence into three minimal touch points.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Card key={idx} hoverEffect className="relative overflow-hidden flex flex-col justify-between border-slate-100">
                <div className="absolute -top-6 -right-6 text-8xl font-black text-slate-50 font-title select-none pointer-events-none -z-10">{step.num}</div>
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${step.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Features Grid */}
      <div className="w-full max-w-5xl mt-24 px-4 py-8 space-y-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-title">Designed for Citizens & Authorities</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">Built to increase trust and bridge communication gaps in local governance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="space-y-3 p-4">
                <div className="w-8 h-8 rounded-lg bg-slate-50 text-primary-blue flex items-center justify-center border border-slate-100">
                  <Icon className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{feat.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-24 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        CivicMind AI © 2026. Made with Google Gemini.
      </div>
    </div>
  );
}
