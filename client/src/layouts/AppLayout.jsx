import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import FAB from '../components/FAB';
import LoadingState from '../components/LoadingState';
import { WifiOff } from 'lucide-react';

export default function AppLayout() {
  const { user, loading, logout, isOffline } = useAuth();
  const location = useLocation();

  const isNoNavPage = ['/', '/login', '/admin', '/home', '/report', '/timeline', '/map', '/profile'].includes(location.pathname) || location.pathname.startsWith('/404');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-bg w-full">
        <LoadingState type="spinner" className="scale-110" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-bg text-slate-800">
      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-warning-orange text-white text-xs font-semibold px-4 py-2.5 flex items-center justify-center gap-2 select-none sticky top-0 z-50 shadow-sm transition-all">
          <WifiOff className="w-4 h-4 text-amber-200 animate-pulse shrink-0" />
          <span>You are currently offline. Connection problems may delay updates.</span>
        </div>
      )}

      {/* Top navbar on desktop */}
      {!isNoNavPage && user && <Navbar user={user} onLogout={logout} />}

      {/* Main viewport */}
      <main className={`flex-1 flex flex-col w-full ${!isNoNavPage && user ? 'pb-24 md:pb-6' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className={`flex-1 flex flex-col w-full ${isNoNavPage ? '' : 'max-w-7xl mx-auto px-4 sm:px-6 py-6'}`}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom navbar on mobile */}
      {!isNoNavPage && user && <BottomNav user={user} />}

      {/* Floating Civic Copilot Assistant */}
      {user && !isNoNavPage && <FAB />}
    </div>
  );
}
