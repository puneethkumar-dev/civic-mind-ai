import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirestoreListener } from '../hooks/useFirestoreListener';
import { MapPin, Layers } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Button from '../components/Button';
import { getCurrentCoordinates } from '../services/locationService';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function CommunityMap({ searchQuery = '' }) {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedPin, setSelectedPin] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);

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

  // Convert Firestore reports to pin objects
  const pins = allReports.map((report) => {
    const cat = getPinCategory(report.aiAnalysis?.category || report.category);
    return {
      id: report.issueId,
      title: report.aiAnalysis?.summary || report.description?.substring(0, 30) || 'Quick Report',
      category: cat,
      address: report.location?.address || 'Unknown coordinates',
      status: report.status || 'Reported',
      priority: report.aiAnalysis?.severity || 'Medium',
      description: report.description || 'No notes provided.',
      rawReport: report
    };
  });

  const filteredPins = pins.filter(p => {
    const matchesCategory = selectedFilter === 'All' || p.category === selectedFilter;
    if (!matchesCategory) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      p.address.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  });

  const pinColors = {
    Water: 'bg-blue-500 text-white shadow-blue-500/30',
    Roads: 'bg-slate-700 text-white shadow-slate-700/30',
    Garbage: 'bg-amber-500 text-white shadow-amber-500/30',
    Streetlights: 'bg-purple-500 text-white shadow-purple-500/30',
  };

  // Geolocation detection on mount
  useEffect(() => {
    getCurrentCoordinates()
      .then(coords => {
        setUserLocation([coords.latitude, coords.longitude]);
      })
      .catch(err => {
        console.warn('Could not detect user coordinates for Community Map:', err);
      });
  }, []);

  // Map instance initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create Leaflet map instance
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true
    });

    // Add zoom control at top-right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Standard OpenStreetMap TileLayer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    mapInstanceRef.current = map;

    // Center map: try userLocation first, then fit to issues, otherwise center on India
    if (userLocation) {
      map.setView(userLocation, 13);
    } else {
      const validCoords = filteredPins
        .map(p => p.rawReport.location)
        .filter(loc => loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number');

      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords.map(c => [c.latitude, c.longitude]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } else {
        map.setView([20.5937, 78.9629], 5); // India center default
      }
    }

    // Cleanup: destroy Leaflet map instance on unmount to prevent duplicates & memory leaks
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Sync user position when geolocator returns coordinates
  useEffect(() => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.setView(userLocation, 13);
    }
  }, [userLocation]);

  // Sync and plot pins on map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    if (markersGroupRef.current) {
      map.removeLayer(markersGroupRef.current);
    }

    // Create a new markers layer group
    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;

    filteredPins.forEach(pin => {
      const loc = pin.rawReport.location;
      if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
        const categoryColor = pinColors[pin.category] || 'bg-slate-700 text-white';
        
        // Custom interactive divIcon HTML matching CivicMind design scheme
        const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div class="relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 border-white transition-all transform hover:scale-110 active:scale-95 duration-200 cursor-pointer ${categoryColor}">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16]
        });

        const marker = L.marker([loc.latitude, loc.longitude], { icon: customIcon });

        // Bind interactive selection click event
        marker.on('click', () => {
          setSelectedPin(pin);
          map.panTo([loc.latitude, loc.longitude]);
        });

        // Custom premium-themed popup on hover/click
        const popupContent = `
          <div class="p-2 min-w-[200px] font-sans">
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-500 border px-2 py-0.5 rounded bg-slate-50">${pin.category}</span>
              <span class="text-xs font-semibold text-slate-600">${pin.status}</span>
            </div>
            <h4 class="font-bold text-sm text-slate-900 leading-tight mb-1.5">${pin.title}</h4>
            <p class="text-xs text-slate-600 leading-normal mb-2.5">${pin.address}</p>
            <div class="text-xs font-medium text-slate-400">Click marker to inspect details.</div>
          </div>
        `;
        marker.bindPopup(popupContent, { closeButton: false });

        marker.on('mouseover', function () {
          this.openPopup();
        });

        marker.addTo(markersGroup);
      }
    });

    // Auto-fit map boundaries to active markers if any exist
    if (filteredPins.length > 0) {
      const validCoords = filteredPins
        .map(p => p.rawReport.location)
        .filter(loc => loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number');
      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords.map(c => [c.latitude, c.longitude]));
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
      }
    }
  }, [filteredPins]);

  return (
    <div className="space-y-6">
      <style>{`
        .leaflet-container {
          font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.15) !important;
          border: 1px solid rgba(241, 245, 249, 0.8) !important;
          padding: 4px !important;
        }
        .leaflet-popup-tip {
          box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.15) !important;
        }
        .leaflet-bar {
          border: none !important;
          box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.1) !important;
          border-radius: 12px !important;
          overflow: hidden;
        }
        .leaflet-bar a {
          background-color: #ffffff !important;
          border-bottom: 1px solid #f1f5f9 !important;
          color: #475569 !important;
          transition: all 0.2s;
        }
        .leaflet-bar a:hover {
          background-color: #f8fafc !important;
          color: #1e293b !important;
        }
        @keyframes pinBounce {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.05); }
          100% { transform: translateY(0) scale(1); }
        }
        .custom-div-icon {
          background: transparent !important;
          border: none !important;
        }
        .custom-div-icon:hover > div {
          animation: pinBounce 0.6s ease-in-out infinite;
          box-shadow: 0 12px 24px -6px rgba(15, 23, 42, 0.25) !important;
        }
      `}</style>

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
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold select-none border transition-all cursor-pointer whitespace-nowrap ${
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
        {/* Real Leaflet Map */}
        <div className="lg:col-span-8">
          <div className="aspect-[4/3] sm:aspect-[16/10] bg-slate-100 rounded-3xl border border-slate-200/80 overflow-hidden relative shadow-inner">
            
            {/* Map wrapper div */}
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Map center indicator */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-slate-200/50 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-sm z-[1000]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live GIS Map</span>
            </div>
          </div>
        </div>

        {/* Pin Details Drawer side bar */}
        <div className="lg:col-span-4 w-full">
          {selectedPin ? (
            <Card className="p-5 border-slate-100 shadow-md flex flex-col gap-4">
              <div className="flex justify-between items-start gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2.5 py-1 bg-slate-100 rounded border">
                  {selectedPin.category}
                </span>
                <Badge status={selectedPin.status} />
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-base font-title">{selectedPin.title}</h3>
                <p className="text-sm text-slate-600 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  {selectedPin.address}
                </p>
              </div>

              <div className="border-t border-b border-slate-50 py-3.5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Priority Severity</span>
                  <Badge status={selectedPin.priority} />
                </div>
                <p className="text-sm text-slate-700 leading-relaxed pt-1">
                  {selectedPin.description}
                </p>
              </div>

              <Button
                variant="primary"
                size="md"
                className="w-full flex items-center justify-center gap-1 text-sm font-semibold py-2.5"
                onClick={() => navigate(`/timeline?id=${selectedPin.id}`)}
              >
                Inspect Timeline details
              </Button>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-6 bg-slate-50/50 rounded-3xl border border-slate-200/40 border-dashed min-h-[160px] lg:min-h-full">
              <div>
                <Layers className="w-9 h-9 text-slate-350 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">No report selected</p>
                <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto leading-relaxed">Click any colored marker pin on the map to show report info, photos, and state assignments.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
