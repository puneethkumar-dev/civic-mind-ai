import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';
import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center min-h-[400px]">
      <div className="p-4 bg-rose-50 text-rose-500 rounded-3xl border border-rose-100 mb-6">
        <AlertCircle className="w-12 h-12 animate-pulse" />
      </div>
      
      <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-title">404 - Page Not Found</h2>
      
      <p className="text-sm text-slate-500 mt-3 max-w-sm leading-relaxed">
        We looked everywhere in the city records, but this page seems to have been routed elsewhere or doesn't exist.
      </p>

      <Link to="/" className="mt-8">
        <Button variant="primary" size="md" className="flex items-center gap-2 select-none cursor-pointer">
          <Home className="w-4 h-4" />
          Back to Safety
        </Button>
      </Link>
    </div>
  );
}
