import Button from './Button';

export default function EmptyState({ 
  title, 
  description, 
  icon: Icon, 
  actionLabel, 
  onAction, 
  className = '' 
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 bg-white border border-slate-100/80 rounded-2xl shadow-sm ${className}`}>
      {Icon && (
        <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 border border-slate-100/50 mb-4">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 mt-2 max-w-xs leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button 
          variant="primary" 
          size="sm" 
          className="mt-5" 
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
