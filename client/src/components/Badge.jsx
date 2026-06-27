export default function Badge({ 
  status = 'Reported', 
  className = '', 
  ...props 
}) {
  const styles = {
    // Timeline States
    'Reported': 'bg-slate-100 text-slate-700 border-slate-200/60',
    'AI Analysis': 'bg-blue-50 text-blue-600 border-blue-200/50 animate-pulse-slow',
    'AI Verified': 'bg-emerald-50 text-emerald-700 border-emerald-200/60 font-semibold',
    'Assigned': 'bg-amber-50 text-amber-700 border-amber-200/60',
    'In Progress': 'bg-indigo-50 text-indigo-600 border-indigo-200/50',
    'Resolved': 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
    'Community Verified': 'bg-emerald-500 text-white border-emerald-600 font-semibold shadow-sm',
    
    // Priorities
    'Low': 'bg-slate-100 text-slate-600 border-slate-200/60',
    'Medium': 'bg-amber-50 text-amber-700 border-amber-200/60',
    'High': 'bg-rose-50 text-rose-600 border-rose-200/50 font-semibold',
    'Critical': 'bg-rose-100 text-rose-800 border-rose-300/60 font-bold animate-pulse',
    
    // Categories (General purpose)
    'Roads': 'bg-slate-100 text-slate-700 border-slate-200',
    'Road Damage': 'bg-slate-100 text-slate-700 border-slate-200',
    'Water': 'bg-blue-50 text-blue-700 border-blue-200',
    'Water Leakage': 'bg-blue-50 text-blue-700 border-blue-200',
    'Garbage': 'bg-amber-50 text-amber-800 border-amber-200',
    'Streetlights': 'bg-purple-50 text-purple-700 border-purple-200',
    'Streetlight': 'bg-purple-50 text-purple-700 border-purple-200',
    'Drainage': 'bg-cyan-50 text-cyan-700 border-cyan-200',
    'Public Property Damage': 'bg-orange-50 text-orange-700 border-orange-200',
    'Illegal Dumping': 'bg-rose-50 text-rose-700 border-rose-200',
    'Other': 'bg-slate-100 text-slate-600 border-slate-200',
  };

  const currentStyle = styles[status] || 'bg-slate-100 text-slate-700 border-slate-200/60';

  return (
    <span 
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${currentStyle} ${className}`} 
      {...props}
    >
      {status === 'AI Analysis' && (
        <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-500 animate-ping"></span>
      )}
      {status}
    </span>
  );
}
