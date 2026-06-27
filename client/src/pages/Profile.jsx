import { useAuth } from '../context/AuthContext';
import { Award, Settings, LogOut, CheckCircle, Shield } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

export default function Profile() {
  const { user, logout, toggleUserRole } = useAuth();

  if (!user) return null;

  const stats = [
    { title: 'Community Points', value: `${user.points} pts`, icon: Award },
    { title: 'Registered Role', value: user.role === 'admin' ? 'Officer' : 'Citizen', icon: Shield },
    { title: 'Achievements', value: `${user.badges?.length || 0}`, icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Profile Settings" 
        subtitle="Manage your profile settings, account role context, and gamified community stats." 
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left column: User Card */}
        <div className="md:col-span-4 space-y-6 w-full">
          <Card className="p-6 text-center border-slate-100 shadow-md">
            <div className="w-20 h-20 bg-primary-light text-primary-blue rounded-full flex items-center justify-center font-bold text-2xl mx-auto shadow-sm border-2 border-primary-blue/10 overflow-hidden select-none">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user.displayName ? user.displayName.charAt(0) : 'C'
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-800 mt-4">{user.displayName || 'Citizen'}</h3>
            <p className="text-xs text-slate-400 mt-1">{user.email}</p>
            <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full text-slate-500 mt-3 border border-slate-200/50 capitalize">
              {user.role} Account
            </span>

            {/* Role simulation helper for prototype review */}
            <div className="mt-8 pt-6 border-t border-slate-50 space-y-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prototype Mode</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-600 border-slate-200/60 cursor-pointer"
                onClick={toggleUserRole}
              >
                <Shield className="w-3.5 h-3.5" />
                {user.role === 'admin' ? 'Demote to Citizen' : 'Promote to Admin'}
              </Button>
            </div>
          </Card>
          
          <Button
            variant="outline"
            size="md"
            className="w-full border-danger-red/10 text-danger-red hover:bg-danger-light hover:border-danger-red/20 justify-center flex items-center gap-2 cursor-pointer"
            onClick={logout}
          >
            <LogOut className="w-4 h-4" />
            Log Out Account
          </Button>
        </div>

        {/* Right column: Stats, Badges, Reports */}
        <div className="md:col-span-8 space-y-6 w-full">
          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat, idx) => (
              <StatCard
                key={idx}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
              />
            ))}
          </div>

          {/* Gamified Badges */}
          <Card className="p-6 border-slate-100 shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-title flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Community Badges
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">Earn achievement rewards by submitting high confidence reports and verifying issues in your street sector.</p>
            
            {user.badges && user.badges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {user.badges.map((badge, idx) => (
                  <div 
                    key={idx} 
                    className="p-3.5 border rounded-2xl flex items-start gap-3 bg-blue-50/50 text-blue-700 border-blue-100"
                  >
                    <Award className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs">{badge.title || badge}</h4>
                      <p className="text-[10px] mt-0.5 leading-relaxed opacity-80">{badge.desc || 'Achievement unlocked.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/50">
                <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-xs text-slate-600">No Badges Earned Yet</h4>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">Your earned achievements will appear here as you file verified civic tickets.</p>
              </div>
            )}
          </Card>

          {/* Profile settings placeholder */}
          <Card className="p-6 border-slate-100 shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-title flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-600" />
              Account Settings
            </h3>
            <div className="space-y-3.5 pt-2">
              {[
                { label: 'Push Notifications', desc: 'Get phone ping updates on ticket status progression.' },
                { label: 'High Accuracy GPS', desc: 'Auto capture coordinates directly from phone sensor.' },
              ].map((opt, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4 pb-3.5 border-b border-slate-50 last:pb-0 last:border-0">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{opt.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</p>
                  </div>
                  <div className="w-10 h-6 bg-primary-blue rounded-full p-0.5 flex items-center justify-end cursor-pointer select-none">
                    <div className="w-5 h-5 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
