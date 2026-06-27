import Card from './Card';

export default function StatCard({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  trendType = 'neutral', // 'up' | 'down' | 'neutral'
  className = '' 
}) {
  const trendColors = {
    up: 'text-success-dark bg-success-green/10 border-success-green/20',
    down: 'text-danger-dark bg-danger-red/10 border-danger-red/20',
    neutral: 'text-slate-600 bg-slate-100 border-slate-200/50',
  };

  return (
    <Card hoverEffect className={`flex items-start gap-4 ${className}`}>
      {Icon && (
        <div className="p-3 bg-slate-50 rounded-xl text-primary-blue border border-slate-100/80">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">{title}</p>
        <h3 className="text-2xl font-bold mt-1 text-slate-900 tracking-tight">{value}</h3>
        {(description || trend) && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {trend && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${trendColors[trendType]}`}>
                {trend}
              </span>
            )}
            {description && (
              <span className="text-xs text-slate-400 truncate">{description}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
