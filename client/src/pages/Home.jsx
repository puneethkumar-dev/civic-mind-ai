import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFirestoreListener } from '../hooks/useFirestoreListener';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard,
  Camera,
  ClipboardList,
  Map,
  Users,
  Settings,
  Search,
  Bell,
  Shield,
  Zap,
  Sparkles,
  MapPin,
  TrendingUp,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Activity,
  Award,
  Trophy,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import bgImage from '../assets/hero_skyline_background.png';

// Import sub-pages to render inside tabs
import ReportIssue from './ReportIssue';
import Timeline from './Timeline';
import CommunityMap from './CommunityMap';
import Profile from './Profile';

export default function Home({ user: initialUser, defaultTab = 'Dashboard' }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [currentTab, setCurrentTab] = useState(defaultTab);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync tab state with route changes
  useEffect(() => {
    setCurrentTab(defaultTab);
  }, [defaultTab]);

  // Global search hotkey listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector('input[placeholder*="Search"]');
        input?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to all reports in real-time
  const allIssues = useFirestoreListener();
  const currentUserReports = allIssues.filter(i => i.reportedBy?.uid === user?.uid);

  // Helper to format timestamps to relative time strings
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recent';
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Compile community activity feed dynamically from all timeline events
  const getActivityStream = () => {
    const activities = [];
    allIssues.forEach(issue => {
      const timeline = issue.timeline || [];
      timeline.forEach(step => {
        // Skip basic initial report log if there are other updates
        if (step.title === 'Reported' && timeline.length > 1) return;
        
        activities.push({
          issueId: issue.issueId,
          title: step.title,
          description: step.description,
          actor: step.actor,
          timestamp: step.timestamp,
          category: issue.aiAnalysis?.category || 'Issue',
          location: issue.location?.address || 'local coordinates'
        });
      });
    });

    // Sort by recency and take top 4
    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 4);
  };

  const dynamicActivities = getActivityStream().filter(act => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      act.actor.toLowerCase().includes(query) ||
      act.title.toLowerCase().includes(query) ||
      act.category.toLowerCase().includes(query) ||
      act.location.toLowerCase().includes(query) ||
      act.description.toLowerCase().includes(query)
    );
  });

  const sidebarLinks = [
    { label: 'Dashboard', path: '/home', icon: LayoutDashboard },
    { label: 'Report Issue', path: '/report', icon: Camera, highlight: true },
    { label: 'My Reports', path: '/timeline', icon: ClipboardList },
    { label: 'Community Map', path: '/map', icon: Map },
    { label: 'Profile & Badges', path: '/profile', icon: Trophy },
  ];

  // ----------------------------------------------------------------------
  // RENDER TAB VIEW ROUTER
  // ----------------------------------------------------------------------
  const renderTabContent = () => {
    switch (currentTab) {
      case 'Report Issue':
        return <ReportIssue />;
      case 'My Reports':
        return <Timeline searchQuery={searchQuery} />;
      case 'Community Map':
        return <CommunityMap searchQuery={searchQuery} />;
      case 'Profile & Badges':
        return <Profile />;
      case 'Dashboard':
      default:
        return (
          <div className="space-y-6 text-left animate-fade-in">
            {/* Greeting Banner */}
            <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-100/80 shadow-premium relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              {/* Background Skyline graphic aligned right */}
              <div className="absolute right-0 top-0 bottom-0 w-[45%] h-full z-0 opacity-15 pointer-events-none hidden md:block">
                <img src={bgImage} className="w-full h-full object-cover object-right" alt="Skyline Overlay" />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent" />
              </div>

              <div className="space-y-2.5 relative z-10 max-w-xl">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-title text-slate-900 leading-tight">
                  Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 font-black">{user?.displayName?.split(' ')[0] || 'Citizen'}</span>!
                </h2>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-semibold">
                  Report local hazards and watch your community improve in real time.
                </p>
              </div>

              {/* Floating Active Points Indicator */}
              <div className="relative z-10 shrink-0 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-4.5 shadow-xl flex items-center gap-4 text-white font-mono text-left">
                <div className="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-450 shrink-0">
                  <Trophy className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[11px] font-black tracking-wide">Citizen Level 2</p>
                  <p className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider font-extrabold">{user?.points || 0} Points Earning</p>
                </div>
              </div>
            </div>

            {/* DIRECT REPORT TARGET PANEL (NO HYPERLOAD) */}
            <Card className="p-8 border-blue-100/50 bg-gradient-to-br from-white to-blue-50/20 shadow-premium rounded-3xl relative overflow-hidden text-center max-w-3xl mx-auto border-2">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Sparkles className="w-32 h-32 text-blue-600 animate-pulse" />
              </div>

              <div className="max-w-xl mx-auto space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 mx-auto hover:scale-105 transition-transform duration-200">
                  <Camera className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-slate-950 font-title">
                    Report a New Community Incident
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">
                    Upload a photo of a pothole, leak, or debris. Our AI will automatically verify, analyze, and dispatch dispatches to municipal units in under 10 seconds.
                  </p>
                </div>

                {/* Upload drag-drop area */}
                <div 
                  onClick={() => navigate('/report')}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-6 bg-white cursor-pointer hover:bg-slate-50/50 transition-all select-none group flex flex-col items-center justify-center gap-2 max-w-md mx-auto"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-50 text-slate-400 group-hover:text-blue-500 flex items-center justify-center transition-colors">
                    +
                  </div>
                  <span className="text-xs font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                    Click here to upload incident photo
                  </span>
                </div>

                <button
                  onClick={() => navigate('/report')}
                  className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-750 text-white text-sm font-black shadow-lg shadow-blue-500/20 cursor-pointer select-none transition-all hover:scale-[1.01]"
                >
                  Report Incident Now (Takes 10s)
                </button>
              </div>
            </Card>

            {/* Secondary widgets: My reports & gamified points */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
              
              {/* Left Column: Stats overview */}
              <div className="md:col-span-4 grid grid-cols-1 gap-4">
                {/* Active Issues Card */}
                <Card className="p-5 bg-white border-slate-100 text-left flex flex-col justify-between hover:shadow-premium transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Active Issues</span>
                      <h4 className="text-2xl font-black text-slate-900 pt-1">
                        {currentUserReports.filter(i => i.status !== 'Resolved').length} Active
                      </h4>
                    </div>
                    <div className="w-8.5 h-8.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                      <ClipboardList className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/timeline')}
                    className="text-xs font-bold text-blue-600 hover:underline mt-4 text-left cursor-pointer border-0 bg-transparent p-0"
                  >
                    Track active timeline →
                  </button>
                </Card>

                {/* Resolved Issues Card */}
                <Card className="p-5 bg-white border-slate-100 text-left flex flex-col justify-between hover:shadow-premium transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Resolved Issues</span>
                      <h4 className="text-2xl font-black text-slate-900 pt-1">
                        {currentUserReports.filter(i => i.status === 'Resolved').length} Resolved
                      </h4>
                    </div>
                    <div className="w-8.5 h-8.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-4 block uppercase tracking-wider">
                    Completed Resolutions
                  </span>
                </Card>

                {/* Pending Verification Card */}
                <Card className="p-5 bg-white border-slate-100 text-left flex flex-col justify-between hover:shadow-premium transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Pending Verification</span>
                      <h4 className="text-2xl font-black text-slate-900 pt-1">
                        {currentUserReports.filter(i => !i.communityVerified && i.status !== 'Resolved').length} Pending
                      </h4>
                    </div>
                    <div className="w-8.5 h-8.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-4 block tracking-wider">
                    Awaiting peer validation
                  </span>
                </Card>

                {/* Impact Points Card */}
                <Card className="p-5 bg-white border-slate-100 text-left flex flex-col justify-between hover:shadow-premium transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Impact Points</span>
                      <h4 className="text-2xl font-black text-slate-900 pt-1">{user?.points || 0} pts</h4>
                    </div>
                    <div className="w-8.5 h-8.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0">
                      <Award className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-4 block uppercase tracking-wider">
                    Badge: Lead Reporter
                  </span>
                </Card>
              </div>

              {/* Right Column: Community fixes activity log */}
              <div className="md:col-span-8 space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="text-base font-extrabold text-slate-950 font-title flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600 animate-pulse shrink-0" />
                    Community Fixes & Activity
                  </h3>
                </div>

                <Card className="border-slate-100 bg-white shadow-premium p-6 rounded-3xl divide-y divide-slate-100/60 text-left">
                  {dynamicActivities.length > 0 ? (
                    dynamicActivities.map((act, index) => (
                      <div key={index} className="flex gap-4 py-4.5 first:pt-0 last:pb-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100/50 text-emerald-600 flex items-center justify-center shrink-0">
                          ✓
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-slate-700 font-medium leading-relaxed">
                            <strong>{act.actor}</strong> {act.title.toLowerCase()} for {act.category.toLowerCase()} at <em>{act.location.split(',')[0]}</em>.
                          </p>
                          <span className="text-[10px] text-slate-400 font-bold block mt-1.5">
                            ⏰ {formatTimeAgo(act.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-slate-400 font-semibold text-xs">
                      No recent community activity logs. Be the first to verify or support active issues!
                    </div>
                  )}
                </Card>
              </div>

            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col lg:flex-row font-sans">
      
      {/* ----------------------------------------------------------------------
          1. DESKTOP LEFT SIDEBAR (UNIFIED SIDEBAR LANGUAGE)
          ---------------------------------------------------------------------- */}
      <aside className="hidden lg:flex flex-col justify-between w-[280px] bg-white border-r border-slate-100/80 p-6 shrink-0 select-none">
        <div className="space-y-9">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              C
            </div>
            <div>
              <span className="font-title font-bold text-lg text-slate-900">CivicMind</span>
              <span className="text-[11px] text-blue-600 font-black ml-1 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100/50">AI</span>
            </div>
          </div>

          {/* Navigation Links list */}
          <nav className="flex flex-col gap-2.5 text-left">
            {sidebarLinks.map((link) => {
              const LinkIcon = link.icon;
              const isActive = currentTab === link.label;
              return (
                <button
                  key={link.label}
                  onClick={() => navigate(link.path)}
                  className={`px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-4 transition-all w-full cursor-pointer relative z-10 ${
                    isActive 
                      ? 'text-white' 
                      : link.highlight
                        ? 'text-blue-600 bg-blue-50/50 border border-blue-100 hover:bg-blue-50'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {/* Gradient backdrop pill for active link */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabPillCitizen" 
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl -z-10 shadow-md shadow-blue-500/20"
                    />
                  )}
                  <LinkIcon className="w-4.5 h-4.5 shrink-0" />
                  {link.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Card block */}
        <div className="bg-[#0a0d18] border border-white/5 rounded-2xl p-4.5 text-left relative overflow-hidden text-white mt-12 group">
          {/* Glowing matrix grid animation mock overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#3b82f6/15,transparent_50%)] pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="w-7 h-7 rounded bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs select-none">
              AI
            </div>
            <div>
              <h5 className="font-bold text-xs text-slate-100 font-title">CivicMind AI</h5>
              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed font-semibold">Smart governance for better communities</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ----------------------------------------------------------------------
          2. MOBILE NAVIGATION DRAWER
          ---------------------------------------------------------------------- */}
      <div className="lg:hidden w-full bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center z-45 sticky top-0 select-none shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8.5 h-8.5 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
            C
          </div>
          <span className="font-title font-bold text-base text-slate-900">CivicMind AI</span>
        </div>
        
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 bg-slate-50 border rounded-lg text-slate-600 hover:text-slate-900"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

        {/* Expandable menu */}
        {mobileMenuOpen && (
          <div className="absolute top-[61px] left-0 right-0 bg-white border-b border-slate-100 p-4 shadow-xl z-50 flex flex-col gap-1 text-left">
            {sidebarLinks.map((link) => {
              const LinkIcon = link.icon;
              return (
                <button
                  key={link.label}
                  onClick={() => { navigate(link.path); setMobileMenuOpen(false); }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3.5 ${
                    currentTab === link.label 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <LinkIcon className="w-4 h-4" />
                  {link.label}
                </button>
              );
            })}
            <button
              onClick={logout}
              className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-3.5 text-rose-500 hover:bg-rose-50 border-t border-slate-100 mt-2"
            >
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------------
          3. MAIN CONTAINER AREA
          ---------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP SEARCH BAR HEADER */}
        <header className="bg-white border-b border-slate-100 px-6 py-4.5 flex items-center justify-between relative select-none">
          {/* Search Input bar */}
          <div className="w-full max-w-md relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search reports, locations..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value && currentTab !== 'My Reports' && currentTab !== 'Community Map') {
                  setCurrentTab('My Reports');
                }
              }}
              className="w-full pl-10 pr-12 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-semibold text-slate-700 bg-slate-50/50"
            />
            {/* Keyboard shortcut */}
            <span className="text-[8px] font-extrabold font-mono text-slate-400 bg-slate-100 border px-1.5 py-0.5 rounded absolute right-3.5 top-1/2 -translate-y-1/2">
              ⌘K
            </span>
          </div>

          {/* Right utility stack */}
          <div className="flex items-center gap-4 relative">
            {/* Citizen status pill */}
            <div className="bg-emerald-50 text-emerald-600 border border-emerald-100/50 font-bold px-3.5 py-1 rounded-full text-[10px] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              Citizen Access
            </div>

            {/* Notification center */}
            <button className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-600 relative">
              <Bell className="w-4.5 h-4.5" />
              <span className="w-4.5 h-4.5 rounded-full bg-rose-500 border border-white text-white text-[8px] font-black absolute -top-1 -right-1 flex items-center justify-center animate-pulse">
                1
              </span>
            </button>

            {/* Profile Dropdown Toggle */}
            <div className="flex items-center gap-3 border-l border-slate-100 pl-4 relative">
              <div className="text-right hidden sm:block">
                <h5 className="text-xs font-extrabold text-slate-800 leading-tight">
                  {user?.displayName || 'Citizen'}
                </h5>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Verified Reporter</p>
              </div>

              {/* Profile button circle A toggles dropdown */}
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-xs font-black shadow-sm cursor-pointer hover:bg-blue-100 transition-all select-none overflow-hidden"
              >
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user?.displayName?.charAt(0) || 'C'
                )}
              </button>

              {/* Dropdown Menu Overlay */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-11 bg-white border border-slate-200/80 rounded-2xl shadow-xl p-4 w-52 z-50 text-left space-y-3"
                    >
                      <div>
                        <h6 className="text-xs font-bold text-slate-900 leading-none">{user?.displayName || 'Citizen'}</h6>
                        <span className="text-[10px] text-slate-450 font-medium block mt-1">{user?.email}</span>
                      </div>
                      <div className="border-t border-slate-100" />
                      <button
                        onClick={() => { setProfileDropdownOpen(false); logout(); }}
                        className="flex items-center gap-2.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl px-2.5 py-2 text-xs font-bold w-full select-none cursor-pointer transition-colors"
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        Log Out Portal
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Tab view injection */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto bg-[#f8fafc]">
          {renderTabContent()}
        </main>
      </div>

    </div>
  );
}
