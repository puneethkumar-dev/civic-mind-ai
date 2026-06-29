import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirestoreListener } from '../hooks/useFirestoreListener';
import { MapPin, Layers } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';

export default function CommunityMap() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedPin, setSelectedPin] = useState(null);

  const allReports = useFirestoreListener();

  // Mapping categories from Firestore to map filter/pin categories
  const categoryMap = {
    'Water Leakage': 'Water',
    'Drainage': 'Water',
    'Road Damage': 'Roads',
    'Public Property Damage': 'Roads',
    'Garbage': 'Garbage',
    'Illegal Dumping': 'Garbage',
    'Streetlight': 'Streetlights'
  };

  const getPinCategory = (category) => {
    return categoryMap[category] || 'Roads';
  };

  const minLat = 12.95;
  const maxLat = 12.99;
  const minLng = 77.56;
  const maxLng = 77.65;

  const getCanvasCoords = (location, index) => {
    if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      // Deterministic positions as fallback using the index
      return {
        x: 20 + (index * 17) % 65,
        y: 20 + (index * 23) % 60
      };
    }
    
    // Normalize lat, lng into 10% to 90% space so they don't go off the edges
    let pctX = ((location.longitude - minLng) / (maxLng - minLng)) * 80 + 10;
    let pctY = (1 - (location.latitude - minLat) / (maxLat - minLat)) * 80 + 10; // invert latitude for screen y
    
    // Bound to [5, 95]
    pctX = Math.max(5, Math.min(95, pctX));
    pctY = Math.max(5, Math.min(95, pctY));
    
    return { x: pctX, y: pctY };
  };

  const pins = allReports.map((report, idx) => {
    const coords = getCanvasCoords(report.location, idx);
    const cat = getPinCategory(report.aiAnalysis?.category || report.category);
    return {
      id: report.issueId,
      x: coords.x,
      y: coords.y,
      title: report.aiAnalysis?.summary || report.description?.substring(0, 30) || 'Quick Report',
      category: cat,
      address: report.location?.address || 'Unknown coordinates',
      status: report.status || 'Reported',
      priority: report.aiAnalysis?.severity || 'Medium',
      description: report.description || 'No notes provided.',
      rawReport: report
    };
  });

  const filteredPins = selectedFilter === 'All' 
    ? pins 
    : pins.filter(p => p.category === selectedFilter);

  const pinColors = {
    Water: 'bg-blue-500 text-white shadow-blue-500/30',
    Roads: 'bg-slate-700 text-white shadow-slate-700/30',
    Garbage: 'bg-amber-500 text-white shadow-amber-500/30',
    Streetlights: 'bg-purple-500 text-white shadow-purple-500/30',
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Community Map" 
        subtitle="Explore civic reports across your neighborhood. Click pins to review active repairs." 
      />

      {/* Map Actions / Filters */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
        {['All', 'Roads', 'Water', 'Garbage', 'Streetlights'].map((filter) => (
          <button
            key={filter}
            onClick={() => {
              setSelectedFilter(filter);
              setSelectedPin(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold select-none border transition-all cursor-pointer whitespace-nowrap ${
              selectedFilter === filter
                ? 'bg-primary-blue text-white border-primary-blue shadow-sm'
                : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Map Placeholder Canvas */}
        <div className="lg:col-span-8">
          <div className="aspect-[4/3] sm:aspect-[16/10] bg-slate-100 rounded-3xl border border-slate-200/80 overflow-hidden relative shadow-inner">
            
            {/* SVG street map mockup */}
            <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
              {/* Rivers / Lakes */}
              <path d="M 0,250 C 150,220 250,300 400,280 C 550,260 700,320 800,290" fill="none" stroke="#93c5fd" strokeWidth="32" strokeLinecap="round" />
              {/* Roads grid */}
              <line x1="100" y1="0" x2="100" y2="600" stroke="#ffffff" strokeWidth="8" />
              <line x1="300" y1="0" x2="300" y2="600" stroke="#ffffff" strokeWidth="12" />
              <line x1="600" y1="0" x2="600" y2="600" stroke="#ffffff" strokeWidth="8" />
              
              <line x1="0" y1="150" x2="800" y2="150" stroke="#ffffff" strokeWidth="10" />
              <line x1="0" y1="380" x2="800" y2="380" stroke="#ffffff" strokeWidth="14" />
              <line x1="0" y1="500" x2="800" y2="500" stroke="#ffffff" strokeWidth="8" />
              
              {/* Diagonal Highway */}
              <line x1="0" y1="600" x2="800" y2="0" stroke="#e2e8f0" strokeWidth="16" strokeDasharray="6,4" />
            </svg>

            {/* Custom Grid Watermark */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-5 pointer-events-none">
              {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="border border-slate-900" />
              ))}
            </div>

            {/* Map center indicator */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-slate-200/50 px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Simulating GPS Area</span>
            </div>

            {/* Positioned Marker pins */}
            {filteredPins.map((pin) => {
              const active = selectedPin?.id === pin.id;
              return (
                <button
                  key={pin.id}
                  onClick={() => setSelectedPin(pin)}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-full transition-all select-none cursor-pointer ${
                    active ? 'scale-125 z-20 ring-4 ring-primary-blue/30' : 'hover:scale-110 z-10'
                  } ${pinColors[pin.category]}`}
                >
                  <MapPin className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Pin Details Drawer side bar */}
        <div className="lg:col-span-4 w-full">
          {selectedPin ? (
            <Card className="p-5 border-slate-100 shadow-md flex flex-col gap-4">
              <div className="flex justify-between items-start gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-0.5 bg-slate-100 rounded border">
                  {selectedPin.category}
                </span>
                <Badge status={selectedPin.status} />
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base font-title">{selectedPin.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                  {selectedPin.address}
                </p>
              </div>

              <div className="border-t border-b border-slate-50 py-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400 font-medium">Priority Severity</span>
                  <Badge status={selectedPin.priority} />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {selectedPin.description}
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full flex items-center justify-center gap-1 text-xs"
                onClick={() => navigate(`/timeline?id=${selectedPin.id}`)}
              >
                Inspect Timeline details
              </Button>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-6 bg-slate-50/50 rounded-3xl border border-slate-200/40 border-dashed min-h-[160px] lg:min-h-full">
              <div>
                <Layers className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-700">No report selected</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">Click any colored marker pin on the map to show report info, photos, and state assignments.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
