import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard,
  Clock,
  Map,
  ClipboardList,
  Layers,
  Users,
  BarChart3, 
  Sparkles,
  Settings,
  Search,
  Bell,
  Shield,
  Zap,
  MapPin,
  TrendingUp,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Eye,
  Tag,
  AlertTriangle,
  GitFork,
  FileText,
  Activity,
  Info,
  ClipboardCheck,
  CheckCircle
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import bgImage from '../assets/hero_skyline_background.png';

export default function AdminDashboard() {
  const { logout } = useAuth();
  
  const [currentTab, setCurrentTab] = useState('Dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');

  // Default Stats Mockup
  const stats = [
    { title: 'Total Reports', value: '142', icon: BarChart3, trend: '↑ 14% this week', trendColor: 'text-emerald-500', lineColor: '#a855f7' },
    { title: 'Awaiting Action', value: '18', icon: Clock, trend: '↓ 8% from last week', trendColor: 'text-emerald-500', lineColor: '#3b82f6' },
    { title: 'Work In Progress', value: '34', icon: ClipboardCheck, trend: '• Stable', trendColor: 'text-blue-500', lineColor: '#8b5cf6' },
    { title: 'Resolved (Monthly)', value: '90', icon: CheckCircle, trend: '↑ 22% from last month', trendColor: 'text-emerald-500', lineColor: '#10b981' },
  ];

  // Default Mock Issues
  const recentIssues = [
    { id: 'CM-9082', title: 'Major Water Leak on 4th Cross Road', reporter: 'Lakshmi Prasad', date: 'Today, 11:30 AM', priority: 'High', status: 'In Progress', dept: 'Water & Sanitation', img: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=100&q=80' },
    { id: 'CM-9079', title: 'Open Garbage Pile Near School', reporter: 'Vikas Shah', date: 'Today, 08:45 AM', priority: 'Critical', status: 'AI Analysis', dept: 'Health & Sanitation', img: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=100&q=80' },
    { id: 'CM-8991', title: 'Broken Pavement Path', reporter: 'Karan Malhotra', date: 'Yesterday', priority: 'Low', status: 'Assigned', dept: 'Public Works', img: 'https://images.unsplash.com/photo-1594913785162-e6785382d365?w=100&q=80' },
    { id: 'CM-8901', title: 'Broken Streetlight', reporter: 'Ravi K.', date: 'June 23', priority: 'Medium', status: 'Resolved', dept: 'Electrical', img: 'https://images.unsplash.com/photo-1506546377750-be95ad2634e0?w=100&q=80' },
  ];

  // Department Open queues list
  const departments = [
    { name: 'Roads & Infrastructure', count: 12, resolved: 40, color: 'bg-blue-600', percent: 77 },
    { name: 'Water & Sanitation', count: 8, resolved: 28, color: 'bg-blue-400', percent: 78 },
    { name: 'Health & Sanitation', count: 15, resolved: 52, color: 'bg-amber-500', percent: 78 },
    { name: 'Electrical & Lighting', count: 3, resolved: 18, color: 'bg-purple-500', percent: 86 },
  ];

  // Sidebar Links styled with Mockup Icons
  const sidebarLinks = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Timeline', icon: Clock },
    { label: 'Community Map', icon: Map },
    { label: 'Reports', icon: ClipboardList },
    { label: 'Departments', icon: Layers },
    { label: 'Citizens', icon: Users },
    { label: 'Analytics', icon: BarChart3 },
    { label: 'AI Insights', icon: Sparkles },
    { label: 'Settings', icon: Settings },
  ];

  // ----------------------------------------------------------------------
  // RENDER TAB VIEW IMPLEMENTATIONS (MOCKUP ACCURATE STYLING)
  // ----------------------------------------------------------------------
  const renderTabContent = () => {
    switch (currentTab) {
      // 1. TIMELINE SUB-SECTION
      case 'Timeline':
        return (
          <div className="space-y-6 text-left animate-fade-in">
            <Card className="p-7 border-slate-100/80 bg-white shadow-premium rounded-3xl">
              <div className="mb-6">
                <h3 className="text-xl font-extrabold text-slate-950 font-title">Municipality Event Log</h3>
                <p className="text-sm text-slate-500 mt-1">Real-time status transitions and operational audits.</p>
              </div>
              <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {[
                  { title: 'Inspection Unit Dispatched', desc: 'Repair officer Arjun M. dispatched to CM-9082 Major Water Leak ticket.', time: '10 mins ago', tag: 'High Impact', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                  { title: 'AI Automated Dispatched & Verification', desc: 'Ticket CM-9079 routed to Health & Sanitation Division. Scan coordinates proximity (0 duplicates found).', time: '1 hour ago', tag: 'AI Success', color: 'bg-purple-50 text-purple-600 border-purple-100' },
                  { title: 'Ticket Resolved & Verified', desc: 'Pothole repairs complete on Sector 4 main lane. Ticket resolved by Officer M. Ramesh.', time: 'Yesterday', tag: 'Resolved', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                  { title: 'New Citizen Request Logged', desc: 'Citizen Karan Malhotra submitted broken streetlight request CM-8901 via voice input.', time: '3 days ago', tag: 'Logged', color: 'bg-slate-50 text-slate-500 border-slate-100' },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-5 relative items-start">
                    <div className={`w-9 h-9 rounded-full ${item.color} border flex items-center justify-center shrink-0 font-bold text-sm relative z-10 shadow-sm`}>
                      ✓
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-slate-900 font-title">{item.title}</h4>
                      <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{item.desc}</p>
                      <div className="flex items-center gap-2 mt-3.5">
                        <span className="text-xs text-slate-400 font-semibold">{item.time}</span>
                        <span className="text-[10px] bg-slate-100 border text-slate-500 px-2 py-0.5 rounded-full font-bold">{item.tag}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      // 2. COMMUNITY MAP SUB-SECTION
      case 'Community Map':
        return (
          <div className="space-y-6 text-left animate-fade-in">
            <Card className="p-7 border-slate-100/80 bg-white shadow-premium rounded-3xl">
              <div className="mb-4">
                <h3 className="text-xl font-extrabold text-slate-950 font-title">Local Incident Matrix Map</h3>
                <p className="text-sm text-slate-500 mt-1">Visualizing active hazard coordinates in the municipality.</p>
              </div>
              <div className="aspect-video bg-slate-50 rounded-2xl border border-slate-200/60 overflow-hidden relative flex items-center justify-center">
                {/* Dot background texture */}
                <div className="absolute inset-0 opacity-[0.08]" style={{
                  backgroundImage: "radial-gradient(#000 2px, transparent 2px)",
                  backgroundSize: "24px 24px"
                }} />
                {/* Simulated Map Pins */}
                <div className="absolute top-[30%] left-[25%] p-2.5 bg-rose-500 text-white rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all text-xs font-bold border border-white/20">
                  <MapPin className="w-3.5 h-3.5 animate-bounce" /> Water Leak (Park Ave)
                </div>
                <div className="absolute bottom-[25%] left-[50%] p-2.5 bg-amber-500 text-white rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all text-xs font-bold border border-white/20">
                  <MapPin className="w-3.5 h-3.5 animate-bounce" /> Garbage Pile (Sector 8)
                </div>
                <div className="absolute top-[45%] right-[20%] p-2.5 bg-indigo-500 text-white rounded-xl shadow-lg flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-all text-xs font-bold border border-white/20">
                  <MapPin className="w-3.5 h-3.5 animate-bounce" /> Streetlight Out (Sector 3)
                </div>
                <span className="text-sm text-slate-400 font-mono">Map telemetry simulation layer active. All coordinates locked.</span>
              </div>
            </Card>
          </div>
        );

      // 3. REPORTS DATABASE MANAGER
      case 'Reports':
        return (
          <div className="space-y-6 text-left animate-fade-in">
            <Card className="p-7 border-slate-100/80 bg-white shadow-premium rounded-3xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-950 font-title">Reports Management Directory</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Filter, audit, and transition live municipality reports.</p>
                </div>
                {/* Filter buttons */}
                <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/50">
                  {['All', 'High', 'Medium', 'Low'].map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilterPriority(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        filterPriority === p ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto no-scrollbar w-full">
                <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] pb-4">
                      <th className="pb-3 font-bold">Issue Details</th>
                      <th className="pb-3 font-bold">Priority</th>
                      <th className="pb-3 font-bold">Department</th>
                      <th className="pb-3 font-bold">Status</th>
                      <th className="pb-3 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-[11px] sm:text-xs">
                    {recentIssues
                      .filter(i => filterPriority === 'All' || i.priority === filterPriority || (filterPriority === 'High' && i.priority === 'Critical'))
                      .map((issue) => (
                        <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="py-4 flex items-center gap-3.5">
                            <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-100 shadow-sm shrink-0">
                              <img src={issue.img} alt="Incident Thumb" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h5 className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-primary-blue transition-colors">{issue.title}</h5>
                              <p className="text-[10px] text-slate-400 mt-1">Ticket ID: {issue.id} • By {issue.reporter}</p>
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge status={issue.priority} />
                          </td>
                          <td className="py-4 text-slate-500 font-bold">
                            {issue.dept}
                          </td>
                          <td className="py-4">
                            <Badge status={issue.status} />
                          </td>
                          <td className="py-4 text-right">
                            <button
                              className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm cursor-pointer select-none transition-colors"
                              onClick={() => alert(`Admin Action: Dispatching ticket ${issue.id}`)}
                            >
                              Dispatch Task
                            </button>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        );

      // 4. DEPARTMENTS PERFORMANCE OVERVIEW
      case 'Departments':
        return (
          <div className="space-y-6 text-left animate-fade-in">
            <Card className="p-7 border-slate-100/80 bg-white shadow-premium rounded-3xl space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-950 font-title">Municipal Divisions Directory</h3>
                <p className="text-sm text-slate-500 mt-0.5">Assigned workloads and performance metrics across departments.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {departments.map((dept, idx) => (
                  <div key={idx} className="p-5 bg-slate-50 border border-slate-150 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-900 text-base font-title">{dept.name}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Division Unit</p>
                      </div>
                      <span className="text-xs font-black text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                        {dept.percent}% SLA
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="bg-white p-3 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Open tickets</span>
                        <h5 className="text-xl font-black text-slate-800 mt-1">{dept.count} Active</h5>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Resolved</span>
                        <h5 className="text-xl font-black text-slate-800 mt-1">{dept.resolved} Tickets</h5>
                      </div>
                    </div>

                    {/* Workload Progress */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-slate-500">
                        <span>Resolution Progress</span>
                        <span>{dept.percent}% resolved</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200/50 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${dept.color}`} style={{ width: `${dept.percent}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      // 5. CITIZENS DIRECTORY
      case 'Citizens':
        return (
          <div className="space-y-6 text-left animate-fade-in">
            <Card className="p-7 border-slate-100/80 bg-white shadow-premium rounded-3xl space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-950 font-title">Registered Citizens Index</h3>
                <p className="text-sm text-slate-500 mt-0.5">Inspect activity points, badge logs, and registered reports.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                {[
                  { name: 'Lakshmi Prasad', email: 'lakshmi@civicmind.org', reports: 5, points: 120, badge: 'Lead Reporter' },
                  { name: 'Vikas Shah', email: 'vikas@civicmind.org', reports: 3, points: 70, badge: 'Sreet Guard' },
                  { name: 'Karan Malhotra', email: 'karan@civicmind.org', reports: 2, points: 45, badge: 'Helper' }
                ].map((citizen, idx) => (
                  <div key={idx} className="p-5 bg-white border border-slate-100 shadow-sm rounded-2xl space-y-4 hover:border-blue-500/20 transition-all text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-sm">
                        {citizen.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{citizen.name}</h4>
                        <p className="text-[10px] text-slate-400 leading-none mt-0.5">{citizen.email}</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3.5 grid grid-cols-2 gap-2 text-center select-none">
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Points</span>
                        <p className="text-xs font-black text-slate-700 mt-0.5">{citizen.points} pts</p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl">
                        <span className="text-[8px] font-bold text-slate-400 uppercase">Reports</span>
                        <p className="text-xs font-black text-slate-700 mt-0.5">{citizen.reports} logged</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-[9px] bg-blue-50 border border-blue-100 text-blue-600 font-extrabold px-2 py-0.5 rounded-full inline-block">
                        {citizen.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      // 6. ANALYTICS GRAPHS
      case 'Analytics':
        return (
          <div className="space-y-6 text-left animate-fade-in">
            <Card className="p-7 border-slate-100/80 bg-white shadow-premium rounded-3xl space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-950 font-title">Municipality Analytics Center</h3>
                <p className="text-sm text-slate-500 mt-0.5">Auditing monthly statistics and regional workload volumes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {/* Wavy Line Chart */}
                <div className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Reports Incoming Over Time</h4>
                  <div className="h-44 w-full flex items-end">
                    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                      <path d="M 0,38 Q 15,20 30,32 T 60,10 T 90,20 L 100,5" fill="none" stroke="#2563eb" strokeWidth="2.5" />
                    </svg>
                  </div>
                  <p className="text-[10px] text-slate-400 font-semibold text-center mt-2">Active telemetry chart details: March - July 2026</p>
                </div>

                {/* Vertical bars chart */}
                <div className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Volume Categorized by Department</h4>
                  <div className="h-44 flex items-end justify-around pt-8">
                    {[
                      { name: 'Roads', h: '80%', color: 'bg-blue-600' },
                      { name: 'Water', h: '60%', color: 'bg-blue-400' },
                      { name: 'Health', h: '95%', color: 'bg-amber-500' },
                      { name: 'Electric', h: '25%', color: 'bg-purple-500' }
                    ].map((bar, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                        <div className={`w-8 rounded-t-lg ${bar.color}`} style={{ height: bar.h }} />
                        <span className="text-[9px] font-bold text-slate-400">{bar.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );

      // 7. AI INSIGHTS DIALOGS
      case 'AI Insights':
        return (
          <div className="space-y-6 text-left animate-fade-in">
            <Card className="p-7 border-slate-100/80 bg-white shadow-premium rounded-3xl space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                  <Sparkles className="w-5.5 h-5.5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-950 font-title">Gemini AI Intelligence Insights</h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-none mt-1">Automated municipal routing efficiency trace.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-left select-none">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Routing Precision</span>
                  <h4 className="text-2xl font-black text-slate-800 mt-1">99.4%</h4>
                  <p className="text-[9px] text-slate-400 mt-1">Tickets routed with zero manual touches.</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Duplicate Savings</span>
                  <h4 className="text-2xl font-black text-slate-800 mt-1">2,300+</h4>
                  <p className="text-[9px] text-slate-400 mt-1">Tickets consolidated dynamically.</p>
                </div>
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Avg Response Reduction</span>
                  <h4 className="text-2xl font-black text-slate-800 mt-1">-34%</h4>
                  <p className="text-[9px] text-slate-400 mt-1">Dispatches sent inside 4.2 seconds.</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl mt-4">
                <h4 className="font-extrabold text-sm text-slate-900 font-title flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-500 shrink-0" /> Dynamic Actionable Alert
                </h4>
                <p className="text-xs text-slate-650 leading-relaxed mt-2.5">
                  Gemini analysis has detected a clustering of water leakage complaints within Sector 4 over the last 48 hours. AI pipeline recommends grouping inspections into a unified local work ticket.
                </p>
              </div>
            </Card>
          </div>
        );

      // 8. SYSTEM CONFIGURATION SETTINGS
      case 'Settings':
        return (
          <div className="space-y-6 text-left animate-fade-in">
            <Card className="p-7 border-slate-100/80 bg-white shadow-premium rounded-3xl space-y-6">
              <div>
                <h3 className="text-xl font-extrabold text-slate-950 font-title">Municipality Portal Settings</h3>
                <p className="text-sm text-slate-500 mt-0.5">Toggle admin configurations and pipeline options.</p>
              </div>

              <div className="space-y-4 pt-4 text-xs font-semibold text-slate-700 text-left max-w-xl">
                {[
                  { label: 'Automated Gemini Routing Dispatch', desc: 'Auto-dispatch ticket once category matching exceeds 95% confidence.', check: true },
                  { label: 'Proximity Duplicate Detection', desc: 'Scan 100m radius of new report to cross-verify duplicate tickets.', check: true },
                  { label: 'Public Timeline Verification Feed', desc: 'Enable public timeline transparency logs for citizen transparency.', check: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-50 p-4 border border-slate-100 rounded-xl gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm font-title">{item.label}</h4>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                    {/* Toggle button mockup */}
                    <button className={`w-11 h-6 rounded-full flex items-center p-0.5 transition-colors shrink-0 cursor-pointer ${item.check ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'}`}>
                      <div className="w-5 h-5 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        );

      case 'Dashboard':
      default:
        return (
          <div className="space-y-6 text-left animate-fade-in">
            
            {/* Header Jumbotron matching mockup */}
            <div className="bg-white rounded-3xl p-6 sm:p-9 border border-slate-100/80 shadow-premium relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              
              {/* Background Skyline graphic aligned right */}
              <div className="absolute right-0 top-0 bottom-0 w-[45%] h-full z-0 opacity-15 pointer-events-none hidden md:block">
                <img src={bgImage} className="w-full h-full object-cover object-right" alt="Skyline Overlay" />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent" />
              </div>

              <div className="space-y-2.5 relative z-10 max-w-xl">
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-title text-slate-900 leading-tight">
                  Municipality Admin <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 font-black">Dashboard</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-semibold">
                  Manage community reports, assign departments, and track resolution metrics.
                </p>
              </div>

              {/* Floating Active Monitor Panel */}
              <div className="relative z-10 shrink-0 bg-slate-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-4.5 shadow-xl flex items-center gap-4 text-white font-mono text-left">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <div>
                  <p className="text-[11px] font-black tracking-wide">AI Monitoring</p>
                  <p className="text-[8px] text-slate-400 mt-0.5 uppercase tracking-wider font-extrabold">Active</p>
                </div>
                {/* Micro trend visual */}
                <div className="h-6 w-12 bg-white/5 rounded flex items-end p-0.5 overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 50 20" preserveAspectRatio="none">
                    <path d="M 0,18 Q 12,4 25,12 T 50,2" fill="none" stroke="#10b981" strokeWidth="1.5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 4 Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {stats.map((stat, idx) => {
                const StatIcon = stat.icon;
                return (
                  <Card key={idx} className="p-6 border-slate-100/90 shadow-premium bg-white flex flex-col justify-between hover:shadow-[0_15px_30px_rgba(0,0,0,0.04)] transition-all duration-300 relative overflow-hidden group">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-sans block">{stat.title}</span>
                        <h3 className="text-4xl font-black font-title tracking-tight text-slate-900 pt-1.5">{stat.value}</h3>
                      </div>
                      
                      {/* Icon */}
                      <div className="w-11 h-11 rounded-xl bg-blue-50/50 text-blue-600 border border-blue-100/30 flex items-center justify-center shrink-0">
                        <StatIcon className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Miniature Chart inside Stats Card */}
                    <div className="mt-5 flex items-center justify-between gap-4">
                      <span className="text-xs font-bold text-emerald-500">{stat.trend}</span>
                      
                      {/* Sparkline svg */}
                      <div className="h-6 w-20 overflow-visible">
                        <svg className="w-full h-full" viewBox="0 0 80 20" preserveAspectRatio="none">
                          <motion.path
                            d="M 0,18 Q 20,4 40,14 T 80,4"
                            fill="none"
                            stroke={stat.lineColor}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.2, delay: idx * 0.1 }}
                          />
                        </svg>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Main Sections: Reports Queue vs Performance charts */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              
              {/* Left Section: Live Queue table */}
              <div className="lg:col-span-7 space-y-4">
                <Card className="p-6 sm:p-7 border-slate-100/90 bg-white shadow-premium rounded-3xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-extrabold text-slate-950 font-title flex items-center gap-2">
                      🔥 Incoming Reports Queue
                    </h3>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/50 uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Realtime
                    </span>
                  </div>

                  <div className="overflow-x-auto no-scrollbar w-full">
                    <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[10px] pb-4">
                          <th className="pb-3 font-bold">Issue Details</th>
                          <th className="pb-3 font-bold">Priority</th>
                          <th className="pb-3 font-bold">Department</th>
                          <th className="pb-3 font-bold">Status</th>
                          <th className="pb-3 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-[11px] sm:text-xs">
                        {recentIssues.map((issue) => (
                          <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors group">
                            <td className="py-4.5 flex items-center gap-3.5">
                              <div className="w-11 h-11 rounded-xl overflow-hidden border border-slate-100 shadow-sm shrink-0">
                                <img src={issue.img} alt="Incident Thumb" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-primary-blue transition-colors">{issue.title}</h5>
                                <p className="text-[10px] text-slate-400 mt-1">By {issue.reporter} • {issue.date}</p>
                              </div>
                            </td>
                            <td className="py-4.5">
                              <Badge status={issue.priority} />
                            </td>
                            <td className="py-4.5 text-slate-500 font-bold">
                              {issue.dept}
                            </td>
                            <td className="py-4.5">
                              <Badge status={issue.status} />
                            </td>
                            <td className="py-4.5 text-right">
                              <button
                                className="px-3.5 py-2 text-xs font-bold text-primary-blue bg-primary-light hover:bg-blue-100 rounded-xl border border-primary-blue/10 cursor-pointer select-none transition-all"
                                onClick={() => alert(`Admin: Managing Ticket ID ${issue.id}`)}
                              >
                                Manage &gt;
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* View All Footer link */}
                  <div className="flex justify-center pt-5 border-t border-slate-100">
                    <button
                      onClick={() => setCurrentTab('Reports')}
                      className="px-6 py-3 rounded-full bg-blue-50 border border-blue-100/50 hover:bg-blue-100 text-blue-600 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      View All Reports →
                    </button>
                  </div>
                </Card>
              </div>

              {/* Right Section: Performance Meters */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Department performance */}
                <Card className="p-6 border-slate-100/90 bg-white shadow-premium rounded-3xl space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-extrabold text-slate-950 font-title">Department Performance</h3>
                    <button className="text-xs font-extrabold text-blue-600 hover:underline">View All</button>
                  </div>
                  
                  <div className="space-y-4.5">
                    {departments.map((dept, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm font-semibold">
                          <span className="text-slate-800 font-medium">{dept.name}</span>
                          <span className="text-slate-400 text-xs font-bold">{dept.count} open ({dept.percent}% resolved)</span>
                        </div>
                        {/* Progress meter */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${dept.color}`}
                              style={{ width: `${dept.percent}%` }}
                            />
                          </div>
                          <span className={`w-10 text-xs font-black text-right border rounded px-1.5 py-0.5 text-slate-800 ${dept.percent >= 80 ? 'text-purple-600 border-purple-100 bg-purple-50' : 'text-blue-600 border-blue-100 bg-blue-50'}`}>
                            {dept.percent}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Incoming volume and AI logs side-by-side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Chart Card */}
                  <Card className="p-5 border-slate-100/90 bg-white shadow-premium rounded-2xl space-y-3.5">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-950 font-title uppercase tracking-wide">Incoming Weekly Volume</h4>
                      <p className="text-[9px] text-slate-400 mt-1">Average reports incoming per day</p>
                    </div>

                    <div className="h-16 w-full relative overflow-hidden flex items-end">
                      <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path
                          d="M 0,25 Q 15,10 30,22 T 60,6 T 100,2"
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 0,25 Q 15,10 30,22 T 60,6 T 100,2 L 100,30 L 0,30 Z"
                          fill="url(#sparkGradient)"
                          opacity="0.1"
                        />
                        <defs>
                          <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute top-0 right-0 text-[9px] font-black bg-blue-100 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded">
                        +12%
                      </div>
                    </div>
                  </Card>

                  {/* AI Insights Card */}
                  <Card className="p-5 border-slate-100/90 bg-white shadow-premium rounded-2xl flex flex-col justify-between text-left">
                    <div className="flex items-center gap-2">
                      <div className="w-6.5 h-6.5 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/30">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </div>
                      <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Insights</h4>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-2.5">
                      AI detected <span className="text-blue-600 font-bold">23% more</span> infrastructure issues this week.
                    </p>

                    <button 
                      onClick={() => setCurrentTab('AI Insights')}
                      className="text-[10px] font-extrabold text-blue-600 flex items-center gap-0.5 hover:underline mt-2.5 cursor-pointer"
                    >
                      View Insights →
                    </button>
                  </Card>
                </div>
              </div>

            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col lg:flex-row font-sans">
      
      {/* ----------------------------------------------------------------------
          1. DESKTOP LEFT SIDEBAR (MOCKUP ACCURATE WIDER & GREATER TEXT SIZES)
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
                  onClick={() => setCurrentTab(link.label)}
                  className={`px-5 py-3 rounded-xl text-sm font-semibold flex items-center gap-4 transition-all w-full cursor-pointer relative z-10 ${
                    isActive 
                      ? 'text-white' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {/* Gradient backdrop pill for active link */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeTabPill" 
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
          className="p-2 bg-slate-50 border rounded-lg text-slate-600 hover:text-slate-905"
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
                  onClick={() => { setCurrentTab(link.label); setMobileMenuOpen(false); }}
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
        
        {/* TOP SEARCH BAR HEADER (MOCKUP ACCURATE) */}
        <header className="bg-white border-b border-slate-100 px-6 py-4.5 flex items-center justify-between relative select-none">
          {/* Search Input bar */}
          <div className="w-full max-w-md relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search reports, locations, citizens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs font-semibold text-slate-700 bg-slate-50/50"
            />
            {/* Keyboard shortcut */}
            <span className="text-[8px] font-extrabold font-mono text-slate-400 bg-slate-100 border px-1.5 py-0.5 rounded absolute right-3.5 top-1/2 -translate-y-1/2">
              ⌘K
            </span>
          </div>

          {/* Right utility stack */}
          <div className="flex items-center gap-4 relative">
            {/* Admin status pill */}
            <div className="bg-rose-50 text-rose-600 border border-rose-100/50 font-bold px-3.5 py-1 rounded-full text-[10px] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-rose-500" />
              Admin Panel
            </div>

            {/* Notification center */}
            <button className="w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-100 flex items-center justify-center text-slate-600 relative">
              <Bell className="w-4.5 h-4.5" />
              <span className="w-4.5 h-4.5 rounded-full bg-rose-500 border border-white text-white text-[8px] font-black absolute -top-1 -right-1 flex items-center justify-center animate-pulse">
                3
              </span>
            </button>

            {/* Profile Dropdown Toggle */}
            <div className="flex items-center gap-3 border-l border-slate-100 pl-4 relative">
              <div className="text-right hidden sm:block">
                <h5 className="text-xs font-extrabold text-slate-800 leading-tight">Admin Officer</h5>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Municipality Admin</p>
              </div>

              {/* Profile button A toggles dropdown */}
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center text-xs font-black shadow-sm cursor-pointer hover:bg-blue-100 transition-all select-none"
                title="Admin Account Details"
              >
                A
              </button>

              {/* Dropdown Menu Overlay */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    {/* Backdrop Click Closes menu */}
                    <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-11 bg-white border border-slate-200/80 rounded-2xl shadow-xl p-4 w-52 z-50 text-left space-y-3"
                    >
                      <div>
                        <h6 className="text-xs font-bold text-slate-900 leading-none">Admin Officer</h6>
                        <span className="text-[10px] text-slate-400 font-medium block mt-1">admin@civicmind.ai</span>
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
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {renderTabContent()}
        </main>
      </div>

    </div>
  );
}
