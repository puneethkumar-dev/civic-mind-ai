import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

export default function Login() {
  const { loginWithGoogle, loginDeveloperMock, error, clearError } = useAuth();

  const handleLoginClick = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      // Error handled by AuthContext state
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12 px-4 relative">
      {/* Decorative Background Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary-blue/5 rounded-full blur-3xl -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 shadow-2xl border-slate-100/80">
          <div className="text-center space-y-3 mb-8">
            <div className="w-12 h-12 bg-primary-blue text-white rounded-2xl flex items-center justify-center font-bold text-xl mx-auto shadow-md animate-pulse">
              C
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-title">Welcome to CivicMind AI</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Report community issues in under 10 seconds. AI handles the bureaucracy. Sign in using your Google credentials.
            </p>
          </div>

          {/* Friendly Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-danger-light border border-danger-red/10 rounded-2xl flex items-start gap-3 text-left relative">
              <AlertCircle className="w-5 h-5 text-danger-red shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-danger-dark">Sign In Error</h4>
                <p className="text-[10px] text-danger-red mt-0.5 leading-relaxed">{error}</p>
              </div>
              <button 
                onClick={clearError}
                className="absolute top-2 right-2 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          <div className="space-y-4">
            {/* Real Google Login Button */}
            <Button
              variant="outline"
              size="lg"
              className="w-full border-slate-200 text-slate-700 font-medium hover:bg-slate-50 flex items-center justify-center gap-2.5 min-h-[48px] cursor-pointer"
              onClick={handleLoginClick}
            >
              <svg className="w-4 h-4 mr-1 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.5 5.5 0 0 1 8.5 13a5.5 5.5 0 0 1 5.491-5.514c2.25 0 4.148 1.486 4.864 3.514l3.665-2.857C20.443 4.228 16.58 2 12.24 2c-6.076 0-11 4.924-11 11s4.924 11 11 11c5.56 0 10.224-4.048 10.93-9.5H12.24Z"
                />
              </svg>
              Sign In with Google
            </Button>

            {/* Developer Mock Login Bypass */}
            <div className="relative my-4 flex items-center">
              <div className="flex-grow border-t border-slate-100"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Local Testing</span>
              <div className="flex-grow border-t border-slate-100"></div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                id="dev-login-citizen"
                onClick={() => loginDeveloperMock('citizen')}
                className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/50 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] select-none"
              >
                👤 Developer Citizen Sign In
              </button>

              <button
                type="button"
                id="dev-login-admin"
                onClick={() => loginDeveloperMock('admin')}
                className="w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/50 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] select-none"
              >
                🏢 Developer Admin Sign In
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
