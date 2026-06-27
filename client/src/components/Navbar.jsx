import { Link, useLocation } from 'react-router-dom';
import { Shield, LogOut } from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const location = useLocation();

  const links = [
    { path: '/home', label: 'Dashboard' },
    { path: '/timeline', label: 'Timeline' },
    { path: '/map', label: 'Community Map' },
    { path: '/profile', label: 'Profile' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="hidden md:block bg-white border-b border-slate-100/80 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 select-none group">
          <div className="w-8 h-8 rounded-lg bg-primary-blue flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
            C
          </div>
          <div>
            <span className="font-title font-bold text-base text-slate-900">CivicMind</span>
            <span className="text-[10px] text-primary-blue font-bold ml-1 bg-primary-light px-1.5 py-0.5 rounded">AI</span>
          </div>
        </Link>

        {/* Links */}
        {user && (
          <nav className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-primary-light text-primary-blue'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Admin Dashboard link */}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all ${
                  isActive('/admin')
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-slate-600 hover:bg-rose-50/50 hover:text-rose-600'
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin Panel
              </Link>
            )}
          </nav>
        )}

        {/* Auth Info */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-800 leading-tight">{user.displayName || 'Citizen'}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user.role} Account</p>
              </div>
              <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden flex items-center justify-center font-bold text-primary-blue text-xs select-none bg-primary-light">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.displayName ? user.displayName.charAt(0) : 'C'
                )}
              </div>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-slate-50 text-slate-400 hover:text-danger-red rounded-xl transition-all cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs font-semibold text-primary-blue hover:text-primary-dark bg-primary-light px-4 py-2.5 rounded-xl border border-primary-blue/10 hover:border-primary-blue/30 transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
