import { useNavigate, Link } from 'react-router-dom';
import { Camera, MapPin, ClipboardList, Map, Bell, Sparkles, Activity, ShieldCheck, TrendingUp, Info } from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useFirestoreListener } from '../hooks/useFirestoreListener';

export default function Home({ user }) {
  const navigate = useNavigate();

  // Listen to all reports in real-time
  const allIssues = useFirestoreListener();

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
        // Skip basic initial report log if there are other updates, to show more interesting items
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

  // Filter unresolved issues and sort by priority score descending (top 4)
  const getPriorityIssues = () => {
    const unresolved = allIssues.filter(issue => issue.status !== 'Resolved');
    
    // Fallback standard issues if none reported yet, to keep the UI beautiful
    if (unresolved.length === 0) {
      return [
        { issueId: 'demo-1', aiAnalysis: { category: 'Road Damage', severity: 'High' }, location: { address: 'MG Road, Sector 4' }, status: 'In Progress', priorityScore: 82, description: 'Deep road potholes.' },
        { issueId: 'demo-2', aiAnalysis: { category: 'Water Leakage', severity: 'Critical' }, location: { address: 'Gandhi Nagar, Lane 2' }, status: 'AI Verified', priorityScore: 78, description: 'Main line pipe burst.' }
      ];
    }

    return unresolved
      .sort((a, b) => {
        const scoreA = a.priorityScore !== undefined ? a.priorityScore : 0;
        const scoreB = b.priorityScore !== undefined ? b.priorityScore : 0;
        return scoreB - scoreA;
      })
      .slice(0, 4);
  };

  const dynamicActivities = getActivityStream();
  const priorityIssuesList = getPriorityIssues();

  return (
    <div className="space-y-6">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Background Sparkles */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none flex items-center justify-center">
          <Sparkles className="w-32 h-32 text-white animate-pulse" />
        </div>
        
        <div className="max-w-xl space-y-2 relative z-10">
          <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-blue-100">
            Citizen Dashboard
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight font-title">
            Hello, {user?.displayName?.split(' ')[0] || 'Citizen'}!
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-medium">
            Your reports help keep our community clean and safe. Report issues in seconds and let AI handle the routing and priority.
          </p>
        </div>
      </div>

      {/* Main Grid: Prominent Action and Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Report an Issue Main CTA */}
        <div className="md:col-span-8">
          <Card 
            hoverEffect 
            onClick={() => navigate('/report')}
            className="h-full border-primary-blue/15 bg-white relative overflow-hidden flex flex-col justify-between p-6 group cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-blue text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
                <Camera className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-primary-blue transition-colors font-title">
                  Report an Issue
                </h3>
                <p className="text-xs sm:text-sm text-slate-505 mt-2 leading-relaxed">
                  Take a photo of a pothole, broken streetlight, or garbage dump, and say/type what's wrong. AI handles all form categorizations.
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-50">
              <span className="text-xs font-bold text-primary-blue group-hover:underline flex items-center gap-1 select-none">
                Start Report (Takes 10s)
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-50 group-hover:bg-primary-light flex items-center justify-center text-slate-400 group-hover:text-primary-blue transition-colors select-none">
                ➔
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Access Menu Cards */}
        <div className="md:col-span-4 grid grid-cols-2 gap-4">
          <Link to="/timeline" className="col-span-1 h-full">
            <Card hoverEffect className="h-full flex flex-col justify-between p-4 bg-white border-slate-100 text-center items-center">
              <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100/50">
                <ClipboardList className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 mt-3">My Reports</p>
              <p className="text-[10px] text-slate-400 mt-1">
                {allIssues.filter(i => i.reportedBy?.uid === user?.uid).length} Reports logged
              </p>
            </Card>
          </Link>
          
          <Link to="/map" className="col-span-1 h-full">
            <Card hoverEffect className="h-full flex flex-col justify-between p-4 bg-white border-slate-100 text-center items-center">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100/50">
                <Map className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 mt-3">Community Map</p>
              <p className="text-[10px] text-slate-400 mt-1">{allIssues.length} issues nearby</p>
            </Card>
          </Link>

          <Card hoverEffect className="col-span-2 p-4 bg-slate-50 border-slate-200/40 flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">Road maintenance scheduled</p>
              <p className="text-[9px] text-slate-400 mt-0.5">MG Road lanes repaved on July 1.</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Nearby Community Activity & Priority Issues Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* Left Side: Priority Issues */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-base font-bold text-slate-900 font-title flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Priority Issues
            </h3>
            <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 border px-2 py-0.5 rounded">
              High Impact
            </span>
          </div>

          <div className="space-y-3">
            {priorityIssuesList.map((issue) => (
              <Card 
                key={issue.issueId} 
                hoverEffect
                onClick={() => issue.issueId.startsWith('demo-') ? navigate('/timeline') : navigate(`/timeline?id=${issue.issueId}`)}
                className="flex items-center justify-between gap-4 border-slate-100 p-4 w-full cursor-pointer select-none"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 capitalize bg-slate-100 px-2 py-0.5 rounded">
                      {issue.aiAnalysis?.category || 'General'}
                    </span>
                    {issue.communityVerified && (
                      <Badge status="Community Verified" className="scale-90" />
                    )}
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm truncate">
                    {issue.description ? (issue.description.substring(0, 45) + (issue.description.length > 45 ? '...' : '')) : 'Quick report ticket'}
                  </h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1 truncate leading-none">
                    <MapPin className="w-3.5 h-3.5 text-slate-350" />
                    {issue.location?.address || 'Captured coordinates'}
                  </p>
                </div>
                
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Priority Score</span>
                  <span className="text-sm font-extrabold text-slate-700 font-title bg-slate-50 border border-slate-200/50 px-2.5 py-1 rounded-xl">
                    🔥 {issue.priorityScore !== undefined ? issue.priorityScore : 25} <span className="text-[10px] font-semibold text-slate-400">/100</span>
                  </span>
                  <Badge status={issue.status} className="scale-90 mt-0.5" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Side: Nearby Community Activity Log */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-base font-bold text-slate-900 font-title flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600 animate-pulse" />
              Nearby Community Activity
            </h3>
          </div>

          <Card className="border-slate-100 shadow-sm p-4 divide-y divide-slate-100/60">
            {dynamicActivities.length > 0 ? (
              dynamicActivities.map((act, index) => (
                <div key={index} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg h-fit shrink-0 mt-0.5">
                    {act.title.includes('Verified') ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : (
                      <Activity className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      <strong>{act.actor}</strong> {act.title.toLowerCase()} for {act.category.toLowerCase()} at <em>{act.location.split(',')[0]}</em>.
                    </p>
                    <span className="text-[9px] text-slate-400 font-bold block mt-1">
                      ⏰ {formatTimeAgo(act.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 font-medium text-xs">
                No recent community activity logs. Be the first to verify or support active issues!
              </div>
            )}
          </Card>
        </div>
        
      </div>
    </div>
  );
}
