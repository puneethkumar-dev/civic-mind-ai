export default function LoadingState({ 
  type = 'spinner', // 'spinner' | 'skeleton'
  rows = 3, 
  className = '' 
}) {
  if (type === 'skeleton') {
    return (
      <div className={`space-y-4 w-full ${className}`}>
        <div className="h-6 bg-slate-200 rounded-lg w-1/3 animate-pulse"></div>
        <div className="space-y-2.5">
          {Array.from({ length: rows }).map((_, i) => (
            <div 
              key={i} 
              className="h-4 bg-slate-200/60 rounded-md w-full animate-pulse" 
              style={{ animationDelay: `${i * 150}ms` }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-12 ${className}`}>
      <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-blue rounded-full animate-spin"></div>
      <p className="text-xs text-slate-500 mt-4 font-semibold tracking-wider animate-pulse uppercase">AI Processing...</p>
    </div>
  );
}
