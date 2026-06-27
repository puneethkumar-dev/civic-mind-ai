import { BarChart3, Clock, ClipboardCheck, CheckCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Button from '../components/Button';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total Reports', value: '142', icon: BarChart3, trend: '+14% this week', trendType: 'up' },
    { title: 'Awaiting Action', value: '18', icon: Clock, trend: '-8%', trendType: 'up' },
    { title: 'Work In Progress', value: '34', icon: ClipboardCheck, trend: 'Stable', trendType: 'neutral' },
    { title: 'Resolved (Monthly)', value: '90', icon: CheckCircle, trend: '+22%', trendType: 'up' },
  ];

  const recentIssues = [
    { id: 'CM-9082', title: 'Major Water Leak on 4th Cross Road', reporter: 'Lakshmi Prasad', date: 'Today, 11:30 AM', priority: 'High', status: 'In Progress', dept: 'Water & Sanitation' },
    { id: 'CM-9079', title: 'Open Garbage Pile Near School', reporter: 'Vikas Shah', date: 'Today, 08:45 AM', priority: 'Critical', status: 'AI Analysis', dept: 'Health & Sanitation' },
    { id: 'CM-8991', title: 'Broken Pavement Path', reporter: 'Karan Malhotra', date: 'Yesterday', priority: 'Low', status: 'Assigned', dept: 'Public Works' },
    { id: 'CM-8901', title: 'Broken Streetlight', reporter: 'Ravi K.', date: 'June 23', priority: 'Medium', status: 'Resolved', dept: 'Electrical' },
  ];

  const departments = [
    { name: 'Roads & Infrastructure', count: 12, resolved: 40, color: 'bg-slate-500' },
    { name: 'Water & Sanitation', count: 8, resolved: 28, color: 'bg-blue-500' },
    { name: 'Health & Sanitation (Garbage)', count: 15, resolved: 52, color: 'bg-amber-500' },
    { name: 'Electrical & Lighting', count: 3, resolved: 18, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader 
        title="Municipality Admin Dashboard" 
        subtitle="Manage community reports, assign departments, and track resolution metrics." 
      />

      {/* Admin stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            trend={stat.trend}
            trendType={stat.trendType}
          />
        ))}
      </div>

      {/* Main Grid: Incoming queue and charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Issues Table */}
        <div className="lg:col-span-8 space-y-4 w-full">
          <Card className="p-6 border-slate-100 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900 font-title">Incoming Reports Queue</h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded border">Realtime</span>
            </div>
            
            <div className="overflow-x-auto no-scrollbar w-full">
              <table className="w-full text-left text-xs border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Issue Details</th>
                    <th className="pb-3 font-semibold">Priority</th>
                    <th className="pb-3 font-semibold">Department</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentIssues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5">
                        <div className="font-bold text-slate-800">{issue.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">By {issue.reporter} • {issue.date}</div>
                      </td>
                      <td className="py-3.5">
                        <Badge status={issue.priority} />
                      </td>
                      <td className="py-3.5 text-slate-500 font-medium">
                        {issue.dept}
                      </td>
                      <td className="py-3.5">
                        <Badge status={issue.status} />
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          className="px-2.5 py-1 text-[10px] font-bold text-primary-blue hover:bg-primary-light rounded border border-primary-blue/10 cursor-pointer select-none"
                          onClick={() => alert(`Admin Demo: Managing ticket ${issue.id}`)}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Pane: Department overview & Sparkline */}
        <div className="lg:col-span-4 space-y-6 w-full">
          {/* Department Open queues */}
          <Card className="p-6 border-slate-100 shadow-md space-y-4">
            <h3 className="text-base font-bold text-slate-900 font-title">Department Loading</h3>
            <div className="space-y-4">
              {departments.map((dept, idx) => {
                const total = dept.count + dept.resolved;
                const ratio = Math.round((dept.resolved / total) * 100);
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 truncate max-w-[150px]">{dept.name}</span>
                      <span className="text-slate-400 font-medium">{dept.count} open ({ratio}% resolved)</span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${dept.color}`}
                        style={{ width: `${ratio}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* SVG Sparkline Incoming Volume Chart */}
          <Card className="p-5 border-slate-100 shadow-md space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Incoming Weekly Volume</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Average reports incoming per day</p>
            </div>
            
            <div className="h-20 w-full bg-slate-50/50 rounded-xl border border-slate-100 flex items-end p-2 relative overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                {/* Chart Grid Lines */}
                <line x1="0" y1="10" x2="100" y2="10" stroke="#f1f5f9" strokeWidth="0.5" />
                <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="0.5" />
                
                {/* Smooth Trend line */}
                <path
                  d="M 0,25 Q 15,10 30,18 T 60,8 T 90,14 L 100,5"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                
                {/* Area Gradient under curve */}
                <path
                  d="M 0,25 Q 15,10 30,18 T 60,8 T 90,14 L 100,5 L 100,30 L 0,30 Z"
                  fill="url(#chartGrad)"
                  opacity="0.1"
                />
                
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute top-2 right-2 text-[9px] font-bold text-slate-500 bg-white border px-1.5 py-0.5 rounded">
                Trend: +12%
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
