import { useNavigate, Link } from 'react-router-dom';
import { Camera, MapPin, ClipboardList, Map, Bell, Sparkles } from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';

export default function Home({ user }) {
  const navigate = useNavigate();

  const mockNearbyIssues = [
    { id: 1, title: 'Broken Water Pipe', location: 'MG Road, Sector 4', status: 'In Progress', time: '2 hours ago' },
    { id: 2, title: 'Large Pothole', location: 'Near Central Library', status: 'AI Analysis', time: '10 mins ago' },
    { id: 3, title: 'Streetlight Blinking', location: 'Gandhi Nagar Street 3', status: 'Assigned', time: '1 day ago' },
    { id: 4, title: 'Overflowing Garbage Bin', location: 'Main Market Road', status: 'Resolved', time: '2 days ago' },
  ];

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
                <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
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
              <p className="text-[10px] text-slate-400 mt-1">2 Active, 4 Resolved</p>
            </Card>
          </Link>
          
          <Link to="/map" className="col-span-1 h-full">
            <Card hoverEffect className="h-full flex flex-col justify-between p-4 bg-white border-slate-100 text-center items-center">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100/50">
                <Map className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-800 mt-3">Community Map</p>
              <p className="text-[10px] text-slate-400 mt-1">12 issues nearby</p>
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

      {/* Nearby Issues list */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 font-title flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-blue" />
            Nearby Issues
          </h3>
          <Link to="/map" className="text-xs font-bold text-primary-blue hover:underline">
            View Map
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {mockNearbyIssues.map((issue) => (
            <Card key={issue.id} hoverEffect className="flex justify-between items-center gap-4 border-slate-100">
              <div className="min-w-0">
                <h4 className="font-bold text-slate-800 text-sm truncate">{issue.title}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1 truncate">
                  <MapPin className="w-3 h-3 text-slate-300" />
                  {issue.location}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge status={issue.status} />
                <span className="text-[9px] text-slate-400 font-medium">{issue.time}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
