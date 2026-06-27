import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, Map, User, Plus } from 'lucide-react';

export default function BottomNav({ user }) {
  const location = useLocation();

  if (!user) return null;

  const navItems = [
    { path: '/home', label: 'Home', icon: Home },
    { path: '/timeline', label: 'Timeline', icon: ClipboardList },
    { path: '/report', label: 'Report', icon: Plus, isAction: true },
    { path: '/map', label: 'Map', icon: Map },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100/90 z-30 shadow-lg px-2 py-1.5 flex items-center justify-around pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        if (item.isAction) {
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center -mt-6 select-none cursor-pointer"
            >
              <div className="w-12 h-12 bg-primary-blue hover:bg-primary-dark text-white rounded-full flex items-center justify-center shadow-lg border-4 border-brand-bg transition-all active:scale-90">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-semibold text-slate-500 mt-1">{item.label}</span>
            </Link>
          );
        }

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center justify-center py-1.5 px-3.5 rounded-xl transition-all select-none cursor-pointer ${
              isActive(item.path)
                ? 'text-primary-blue font-semibold scale-105'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
