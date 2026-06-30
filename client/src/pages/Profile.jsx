import { useAuth } from '../context/AuthContext';
import { Award, Settings, LogOut, CheckCircle, Shield, Trophy, Flame, Lock, Trophy as RankIcon } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';

export default function Profile() {
  const { user, logout, toggleUserRole } = useAuth();

  if (!user) return null;

  const level = Math.floor((user.points || 0) / 100) + 1;
  const currentLevelPoints = (user.points || 0) % 100;
  const nextLevelPoints = 100;
  const progressPercent = Math.min((currentLevelPoints / nextLevelPoints) * 100, 100);

  const stats = [
    { title: 'Community Points', value: `${user.points} pts`, icon: Award },
    { title: 'Registered Role', value: user.role === 'admin' ? 'Officer' : 'Citizen', icon: Shield },
    { title: 'Level Rank', value: `Level ${level}`, icon: Trophy },
  ];

  const allBadges = [
    { title: 'Helper', desc: 'Unlocks instantly upon filing your first ticket.', requiredPoints: 0, icon: CheckCircle },
    { title: 'Civic Scout', desc: 'Earn 50 points. Start scouting your neighborhood.', requiredPoints: 50, icon: Trophy },
    { title: 'Street Sentinel', desc: 'Earn 100 points. Maintain active reports.', requiredPoints: 100, icon: Shield },
    { title: 'Community Pillar', desc: 'Earn 200 points. Active validation voter.', requiredPoints: 200, icon: Award },
    { title: 'Eagle Eye', desc: 'Earn 300 points. Spot issues with flawless accuracy.', requiredPoints: 300, icon: Flame }
  ];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Profile Settings" 
        subtitle="Manage your profile settings, account role context, and gamified community stats." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column: User Card */}
        <div className="lg:col-span-4 space-y-6 w-full">
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
        <div className="lg:col-span-8 space-y-6 w-full text-left">
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

          {/* Gamified Level Progress */}
          <Card className="p-5 border-slate-100 shadow-md space-y-4">
            <div className="flex justify-between items-center select-none">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500 fill-current animate-pulse" />
                <h4 className="font-extrabold text-slate-800 text-sm font-title">Citizen Level {level} Progression</h4>
              </div>
              <span className="text-[9px] font-black uppercase text-indigo-650 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/30">
                {user.points || 0} Total XP Points
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="w-full bg-slate-100 rounded-full h-4.5 overflow-hidden border border-slate-200/50 p-0.5 relative shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500 shadow-sm relative overflow-hidden"
                  style={{ width: `${progressPercent}%` }}
                >
                  {/* Glowing stripe reflection */}
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
                <span>Level {level}</span>
                <span className="font-mono text-indigo-650">{currentLevelPoints} / {nextLevelPoints} XP to Level {level + 1}</span>
              </div>
            </div>
          </Card>

          {/* Gamified Badges */}
          <Card className="p-6 border-slate-100 shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-title flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              Community Achievements & Badges
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">Earn achievement rewards by submitting high confidence reports and verifying issues in your street sector.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {allBadges.map((badge, idx) => {
                const isUnlocked = (user.points || 0) >= badge.requiredPoints || user.badges?.includes(badge.title);
                const BadgeIcon = badge.icon;
                return (
                  <div 
                    key={idx} 
                    className={`p-4 border rounded-3xl flex items-start gap-3.5 transition-all duration-300 ${
                      isUnlocked 
                        ? 'bg-gradient-to-br from-amber-50/20 to-blue-50/20 text-slate-800 border-amber-250 shadow-sm hover:shadow-premium hover:-translate-y-0.5' 
                        : 'bg-slate-50/45 text-slate-450 border-slate-200/60 opacity-60 select-none'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                      isUnlocked ? 'bg-amber-100 text-amber-600 border border-amber-200/30' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isUnlocked ? <BadgeIcon className="w-5.5 h-5.5" /> : <Lock className="w-5.5 h-5.5" />}
                    </div>
                    <div className="min-w-0 space-y-1 text-left">
                      <h4 className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                        {badge.title}
                        {isUnlocked ? (
                          <span className="text-[8px] font-black bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-amber-200/50">Unlocked</span>
                        ) : (
                          <span className="text-[8px] font-black bg-slate-100 text-slate-450 px-1.5 py-0.5 rounded-md uppercase tracking-wider border border-slate-200/50">{badge.requiredPoints} XP</span>
                        )}
                      </h4>
                      <p className={`text-[10px] leading-relaxed font-medium ${isUnlocked ? 'text-slate-500' : 'text-slate-400'}`}>
                        {badge.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Community Leaderboard */}
          <Card className="p-6 border-slate-100 shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-title flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Neighborhood Leaderboard
            </h3>
            <p className="text-xs text-slate-500">Compete with citizens in your sector. Top reporters gain community recognition badges.</p>
            
            <div className="space-y-2.5 pt-2">
              {[
                { name: 'Lakshmi Prasad', points: 180, rank: 1, avatar: 'L' },
                { name: user.displayName || 'You', points: user.points || 0, rank: 2, isMe: true, avatar: user.displayName?.charAt(0) || 'C' },
                { name: 'Vikas Shah', points: 70, rank: 3, avatar: 'V' },
                { name: 'Karan Malhotra', points: 45, rank: 4, avatar: 'K' }
              ]
                .sort((a, b) => b.points - a.points)
                .map((row, idx) => {
                  const displayRank = idx + 1;
                  return (
                    <div 
                      key={idx} 
                      className={`p-3 rounded-2xl flex items-center justify-between border ${
                        row.isMe 
                          ? 'bg-blue-50/40 border-blue-100/60 ring-2 ring-blue-500/10' 
                          : 'bg-slate-50/30 border-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black w-5 text-center ${
                          displayRank === 1 ? 'text-amber-500 text-xs' : displayRank === 2 ? 'text-slate-400' : 'text-slate-450'
                        }`}>
                          {displayRank === 1 ? '🥇' : displayRank === 2 ? '🥈' : displayRank === 3 ? '🥉' : `${displayRank}`}
                        </span>
                        
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs select-none ${
                          row.isMe ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-650'
                        }`}>
                          {row.avatar}
                        </div>
                        
                        <div>
                          <h5 className={`text-xs font-bold ${row.isMe ? 'text-blue-700' : 'text-slate-700'}`}>
                            {row.name} {row.isMe && <span className="text-[8px] font-black uppercase text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-100/50">You</span>}
                          </h5>
                          <p className="text-[9px] text-slate-400 font-semibold mt-0.5">Verified Contributor</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-650">{row.points} pts</span>
                    </div>
                  );
                })}
            </div>
          </Card>

          {/* Account settings */}
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
