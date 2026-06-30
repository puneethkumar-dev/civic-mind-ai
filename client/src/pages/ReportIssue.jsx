import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../hooks/useLocation';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { storageService } from '../services/storageService';
import { createIssueDoc, updateLocalIssue } from '../services/firestoreService';
import { auth } from '../services/firebaseConfig';
import { Camera, Image as ImageIcon, Mic, MicOff, CheckCircle2, Loader2, FileText, Home, Plus, RefreshCw, Sparkles, Brain, AlertTriangle, Eye, Tags, Send, Layers } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import PageHeader from '../components/PageHeader';
import { API_URL } from '../config/api';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const getStageIcon = (iconName, colorClass) => {
  switch (iconName) {
    case 'Eye': return <Eye className={`w-4.5 h-4.5 ${colorClass}`} />;
    case 'Tags': return <Tags className={`w-4.5 h-4.5 ${colorClass}`} />;
    case 'AlertTriangle': return <AlertTriangle className={`w-4.5 h-4.5 ${colorClass}`} />;
    case 'Send': return <Send className={`w-4.5 h-4.5 ${colorClass}`} />;
    case 'Layers': return <Layers className={`w-4.5 h-4.5 ${colorClass}`} />;
    case 'FileText': return <FileText className={`w-4.5 h-4.5 ${colorClass}`} />;
    default: return <Sparkles className={`w-4.5 h-4.5 ${colorClass}`} />;
  }
};

export default function ReportIssue() {
  const navigate = useNavigate();
  const { user, updateUserPoints } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Capture, 2: Review/Describe, 2.5: AI Pipeline, 3: Success
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // { issueId, trackingId }
  const [typeManually, setTypeManually] = useState(false);
  const [manualText, setManualText] = useState('');
  
  // AI Pipeline tracking states
  const [aiStage, setAiStage] = useState(0);
  const [lowConfidenceData, setLowConfidenceData] = useState(null);
  const [trackingId, setTrackingId] = useState('');

  const fileInputRef = useRef(null);
  
  const locationHook = useLocation();
  const speechHook = useSpeechToText();

  // Camera capture integration
  const [showCameraView, setShowCameraView] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  // Map picker integration refs
  const reportMapContainerRef = useRef(null);
  const reportMapInstanceRef = useRef(null);
  const reportMarkerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Leaflet map picker synchronization
  useEffect(() => {
    if (step !== 2 || !locationHook.coords || !reportMapContainerRef.current) {
      if (reportMapInstanceRef.current) {
        reportMapInstanceRef.current.remove();
        reportMapInstanceRef.current = null;
        reportMarkerRef.current = null;
      }
      return;
    }

    const { latitude, longitude } = locationHook.coords;

    if (!reportMapInstanceRef.current) {
      const map = L.map(reportMapContainerRef.current, {
        zoomControl: false,
        attributionControl: true
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      map.setView([latitude, longitude], 16);
      reportMapInstanceRef.current = map;

      const draggableIcon = L.divIcon({
        className: 'custom-report-icon',
        html: `
          <div class="relative flex items-center justify-center w-9 h-9 rounded-full bg-primary-blue text-white shadow-xl border-2 border-white transition-all transform hover:scale-110 active:scale-95 duration-200 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      const marker = L.marker([latitude, longitude], {
        icon: draggableIcon,
        draggable: true
      }).addTo(map);

      reportMarkerRef.current = marker;

      // Handle marker drag
      marker.on('dragend', async () => {
        const newLatLng = marker.getLatLng();
        await locationHook.updateCoordinates(newLatLng.lat, newLatLng.lng);
        map.panTo(newLatLng);
      });

      // Handle map click
      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        await locationHook.updateCoordinates(lat, lng);
        map.panTo([lat, lng]);
      });
    } else {
      const map = reportMapInstanceRef.current;
      const marker = reportMarkerRef.current;
      if (marker) {
        const currentMarkerLatLng = marker.getLatLng();
        if (Math.abs(currentMarkerLatLng.lat - latitude) > 0.00001 || Math.abs(currentMarkerLatLng.lng - longitude) > 0.00001) {
          marker.setLatLng([latitude, longitude]);
          map.setView([latitude, longitude], map.getZoom());
        }
      }
    }
  }, [step, locationHook.coords]);

  // Clean up map instance on component unmount
  useEffect(() => {
    return () => {
      if (reportMapInstanceRef.current) {
        reportMapInstanceRef.current.remove();
        reportMapInstanceRef.current = null;
        reportMarkerRef.current = null;
      }
    };
  }, []);

  const handleCameraStart = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setShowCameraView(true);
      setTimeout(async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setCameraStream(stream);
          }
        } catch (err) {
          console.error('Camera access error:', err);
          alert('Camera permission denied or unavailable. Opening file manager instead.');
          setShowCameraView(false);
          triggerFileSelect(false);
        }
      }, 100);
    } else {
      triggerFileSelect(true);
    }
  };

  const handleCameraCapture = () => {
    if (videoRef.current && cameraStream) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setStep(2);
            locationHook.fetchLocation();
            handleCameraStop();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  const handleCameraStop = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraView(false);
  };

  const aiStages = [
    { name: 'Vision Agent', desc: 'Analyzing image details & identifying issue...', icon: 'Eye' },
    { name: 'Categorization Agent', desc: 'Standardizing category rules...', icon: 'Tags' },
    { name: 'Priority Agent', desc: 'Calculating safety severity levels...', icon: 'AlertTriangle' },
    { name: 'Routing Agent', desc: 'Assigning responsible municipal division...', icon: 'Send' },
    { name: 'Duplicate Agent', desc: 'Scanning nearby reported issues...', icon: 'Layers' },
    { name: 'Summary Agent', desc: 'Generating factual official summary logs...', icon: 'FileText' }
  ];

  // Step 1 handlers
  const triggerFileSelect = (captureEnvironment = false) => {
    if (fileInputRef.current) {
      if (captureEnvironment) {
        fileInputRef.current.setAttribute('capture', 'environment');
      } else {
        fileInputRef.current.removeAttribute('capture');
      }
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStep(2);
      locationHook.fetchLocation(); // Automatically capture location coordinates
    }
  };

  const handleSimulatedSnap = async (type) => {
    const response = await fetch('https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=500&auto=format&fit=crop&q=60');
    const blob = await response.blob();
    const file = new File([blob], `${type}_simulated.jpg`, { type: 'image/jpeg' });
    
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStep(2);
    locationHook.fetchLocation();
  };

  // Step 2 handlers
  const handleMicToggle = () => {
    if (speechHook.isListening) {
      speechHook.stopListening();
    } else {
      speechHook.startListening();
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    
    setIsSubmitting(true);
    setStep(2.5); // Go to AI analysis loader screen
    setAiStage(0);

    // Start progress step simulation timer
    let stageInterval = setInterval(() => {
      setAiStage(prev => {
        if (prev < 5) return prev + 1;
        return prev;
      });
    }, 800);

    try {
      // 1. Upload file (uses abstracted Storage driver)
      const uploadPath = `issues/${Date.now()}_${selectedFile.name}`;
      const uploadRes = await storageService.uploadFile(uploadPath, selectedFile);
      
      // 2. Format Geolocation details
      const locationPayload = locationHook.coords ? {
        latitude: locationHook.coords.latitude,
        longitude: locationHook.coords.longitude,
        address: locationHook.address || 'Unknown Address',
      } : null;

      // 3. Extract description text
      const descPayload = typeManually ? manualText : (speechHook.transcript || '');

      // 4. Retrieve auth headers with ID token
      const headers = { 'Content-Type': 'application/json' };
      if (auth?.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        } catch (e) {
          console.warn('Failed to retrieve Firebase ID token, using fallback:', e);
          headers['Authorization'] = `Bearer ${user?.uid || ''}`;
        }
      } else if (user?.uid) {
        headers['Authorization'] = `Bearer ${user.uid}`;
      }

      // 5. POST to /api/issues directly on backend
      const response = await fetch(`${API_URL}/api/issues`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          description: descPayload,
          location: locationPayload,
          imageReference: uploadRes.url
        })
      });
      const data = await response.json();

      clearInterval(stageInterval);

      if (data.success) {
        if (data.data.lowConfidence) {
          // Vision confidence is low! Trigger clarification screen
          setLowConfidenceData({
            issueId: data.data.issueId,
            visualDescription: data.data.visualDescription
          });
          setTrackingId(data.data.trackingId);
          // Sync offline local storage
          updateLocalIssue(data.data.issueId, null, [
            {
              title: 'Reported',
              description: 'Issue reported by citizen.',
              actor: 'Citizen',
              timestamp: new Date().toISOString()
            },
            {
              title: 'Awaiting Clarification',
              description: `AI Vision Agent requested clarification: "${data.data.visualDescription}"`,
              actor: 'Vision Agent',
              timestamp: new Date().toISOString()
            }
          ], {
            trackingId: data.data.trackingId,
            description: descPayload,
            location: locationPayload,
            imageReference: uploadRes.url,
            status: 'Awaiting Clarification',
            reportedBy: {
              uid: user?.uid || 'mock-citizen',
              displayName: user?.displayName || 'Citizen',
              email: user?.email || ''
            }
          });
        } else {
          // Success! Update local results and go to Success step
          setTrackingId(data.data.trackingId || data.data.aiAnalysis?.trackingId || '');
          setSubmitResult({
            issueId: data.data.issueId,
            trackingId: data.data.trackingId,
            aiAnalysis: data.data.aiAnalysis
          });
          updateLocalIssue(data.data.issueId, data.data.aiAnalysis, data.data.timeline, {
            trackingId: data.data.trackingId || trackingId,
            description: descPayload,
            location: locationPayload,
            imageReference: uploadRes.url,
            status: 'AI Verified',
            reportedBy: {
              uid: user?.uid || 'mock-citizen',
              displayName: user?.displayName || 'Citizen',
              email: user?.email || ''
            }
          });
          updateUserPoints(15);
          setStep(3);
        }
      } else {
        throw new Error(data.message || 'AI pipeline failed.');
      }
    } catch (e) {
      clearInterval(stageInterval);
      console.error(e);
      alert('AI Pipeline Error: ' + e.message + '. Redirecting to timeline.');
      navigate('/timeline');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clarification Submission
  const handleClarification = async (chosenCategory) => {
    if (!lowConfidenceData) return;
    
    const categoryMapping = {
      'Road': 'Road Damage',
      'Water': 'Water Leakage',
      'Garbage': 'Garbage',
      'Streetlight': 'Streetlight'
    };
    
    const categoryName = categoryMapping[chosenCategory] || 'Other';
    
    setIsSubmitting(true);
    setLowConfidenceData(null);
    setStep(2.5); // Re-show loader
    setAiStage(2); // Fast-forward to Category/Priority since category is known

    let stageInterval = setInterval(() => {
      setAiStage(prev => {
        if (prev < 5) return prev + 1;
        return prev;
      });
    }, 800);

    try {
      const locationPayload = locationHook.coords ? {
        latitude: locationHook.coords.latitude,
        longitude: locationHook.coords.longitude,
        address: locationHook.address || 'Unknown Address',
      } : null;
      const descPayload = typeManually ? manualText : (speechHook.transcript || '');

      // Retrieve auth headers with ID token
      const headers = { 'Content-Type': 'application/json' };
      if (auth?.currentUser) {
        try {
          const token = await auth.currentUser.getIdToken();
          headers['Authorization'] = `Bearer ${token}`;
        } catch (e) {
          console.warn('Failed to retrieve Firebase ID token, using fallback:', e);
          headers['Authorization'] = `Bearer ${user?.uid || ''}`;
        }
      } else if (user?.uid) {
        headers['Authorization'] = `Bearer ${user.uid}`;
      }

      // POST to /api/issues on backend with clarification details
      const response = await fetch(`${API_URL}/api/issues`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          issueId: lowConfidenceData.issueId,
          clarificationCategory: categoryName,
          description: descPayload,
          location: locationPayload
        })
      });
      const data = await response.json();
      clearInterval(stageInterval);

      if (data.success) {
        setSubmitResult({
          issueId: lowConfidenceData.issueId,
          trackingId: trackingId || data.data.trackingId,
          aiAnalysis: data.data.aiAnalysis
        });
        updateLocalIssue(lowConfidenceData.issueId, data.data.aiAnalysis, data.data.timeline, {
          status: 'AI Verified'
        });
        updateUserPoints(15);
        setStep(3);
      } else {
        throw new Error(data.message || 'AI pipeline failed.');
      }
    } catch (e) {
      clearInterval(stageInterval);
      console.error(e);
      alert('AI Pipeline Error: ' + e.message);
      navigate('/timeline');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setSubmitResult(null);
    setManualText('');
    setTypeManually(false);
    setTrackingId('');
    setLowConfidenceData(null);
    locationHook.resetLocation();
    speechHook.resetTranscript();
    setStep(1);
  };

  return (
    <div className="max-w-xl mx-auto py-2 md:py-6">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {showCameraView && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex flex-col items-center justify-center p-4 sm:p-6 animate-fadeIn select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 max-w-md w-full flex flex-col gap-4 text-center">
            <h3 className="text-white font-bold font-title text-base sm:text-lg flex items-center justify-center gap-2">
              <Camera className="w-5 h-5 text-primary-blue animate-pulse" />
              Capture Incident Photo
            </h3>
            
            {/* Video Viewport */}
            <div className="aspect-[4/3] bg-black rounded-2xl overflow-hidden border border-slate-800 relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover" 
              />
              {!cameraStream && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400 font-semibold animate-pulse">
                  Requesting camera stream...
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={handleCameraStop}
                className="w-full justify-center"
              >
                Cancel
              </Button>
              
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleCameraCapture}
                disabled={!cameraStream}
                className="w-full justify-center"
              >
                📸 Capture Photo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Media capture selection */}
      {step === 1 && (
        <div className="space-y-8 animate-fadeIn">
          <PageHeader 
            title="⚡ Quick Report" 
            subtitle="Report potholes, leaks, or broken streetlights in under 10 seconds. AI handles routing." 
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
            <button
              type="button"
              onClick={handleCameraStart}
              className="flex flex-col items-center justify-center p-8 bg-primary-blue hover:bg-primary-dark text-white rounded-3xl shadow-premium hover:shadow-xl hover:scale-[1.01] transition-all text-center min-h-[160px] w-full select-none cursor-pointer border-0 group"
            >
              <div className="p-4 bg-white/10 rounded-2xl mb-4 group-hover:scale-105 transition-transform">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-black font-title leading-tight">Take Incident Photo</h3>
              <p className="text-xs text-blue-100/70 mt-1.5 max-w-[200px]">Capture pothole, debris or leaks using your device camera</p>
            </button>

            <button
              type="button"
              onClick={() => triggerFileSelect(false)}
              className="flex flex-col items-center justify-center p-8 bg-white hover:bg-slate-50/50 text-slate-800 rounded-3xl border border-slate-150 shadow-premium hover:shadow-xl hover:scale-[1.01] transition-all text-center min-h-[160px] w-full select-none cursor-pointer group"
            >
              <div className="p-4 bg-slate-50 group-hover:bg-slate-100 rounded-2xl mb-4 text-slate-650 group-hover:scale-105 transition-transform border border-slate-100">
                <ImageIcon className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-lg font-black font-title leading-tight">Upload from Gallery</h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-[200px]">Select an existing image attachment from local storage</p>
            </button>
          </div>

          <div className="relative my-8 flex items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-400 font-bold uppercase tracking-wider">Review Simulator</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSimulatedSnap('pothole')}
              className="flex flex-col items-center justify-center p-5 bg-white border border-slate-100 hover:bg-slate-50 rounded-2xl shadow-sm text-center select-none cursor-pointer"
            >
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500 mb-2 text-base">
                🚧
              </div>
              <span className="text-xs font-bold text-slate-700">Simulate Pothole</span>
            </button>

            <button
              onClick={() => handleSimulatedSnap('streetlight')}
              className="flex flex-col items-center justify-center p-5 bg-white border border-slate-100 hover:bg-slate-50 rounded-2xl shadow-sm text-center select-none cursor-pointer"
            >
              <div className="p-2 bg-slate-50 rounded-lg text-slate-500 mb-2 text-base">
                💡
              </div>
              <span className="text-xs font-bold text-slate-700">Simulate Light</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Location & Description Review */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <PageHeader 
            title="Review Report Details" 
            subtitle="GPS location is captured automatically. Add optional notes." 
          />

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-stretch">
            <div className="sm:col-span-5 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 aspect-video sm:aspect-square relative max-h-[220px]">
              {previewUrl && (
                <img src={previewUrl} alt="Report Preview" className="w-full h-full object-cover" />
              )}
            </div>
            
            <div className="sm:col-span-7 flex flex-col justify-between gap-3">
              <Card className={`flex-grow flex flex-col justify-center gap-3 p-5 transition-all ${
                !locationHook.loading && !locationHook.error && locationHook.coords
                  ? 'border-emerald-250 bg-emerald-50/10 shadow-sm'
                  : 'border-slate-100'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Location Status</span>
                  {!locationHook.loading && !locationHook.error && locationHook.coords && (
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-100/60 px-2 py-0.5 rounded-md border border-emerald-200/50 flex items-center gap-1 uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Location Verified
                    </span>
                  )}
                </div>
                
                {locationHook.loading ? (
                  <div className="flex items-center gap-2.5 text-sm text-primary-blue font-bold animate-pulse py-2.5">
                    <Loader2 className="w-4 h-4 animate-spin text-primary-blue" />
                    Fetching GPS coordinates...
                  </div>
                ) : locationHook.error ? (
                  <div className="space-y-3 text-left">
                    <p className="text-sm text-danger-red font-bold leading-relaxed flex items-center gap-1.5">
                      ⚠️ GPS Failed: {locationHook.error}
                    </p>
                    <p className="text-xs text-slate-500 font-semibold">Select a preset sector location manually:</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {['Indiranagar', 'MG Road', 'Gandhi Nagar', 'Market Area'].map((hood) => (
                        <button
                          key={hood}
                          type="button"
                          onClick={() => locationHook.setManualLocation(hood)}
                          className="px-3.5 py-1.5 text-xs bg-white hover:bg-primary-light hover:text-primary-blue text-slate-700 font-extrabold rounded-xl border border-slate-200 hover:border-primary-blue/30 transition-all cursor-pointer"
                        >
                          {hood}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-left">
                    <div className="flex items-start gap-2 pt-1 select-all">
                      <span className="text-lg shrink-0 mt-0.5">📍</span>
                      <div>
                        <p className="text-sm font-extrabold text-slate-900 leading-snug">
                          {locationHook.address}
                        </p>
                        {locationHook.coords && (
                          <p className="text-[10px] text-slate-450 font-mono mt-1 font-semibold">
                            Coordinates: {locationHook.coords.latitude.toFixed(6)}, {locationHook.coords.longitude.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Accuracy and Source block */}
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-450 pt-2 border-t border-slate-100">
                      <span>Source: <strong className="text-slate-650 font-extrabold">{locationHook.coords?.latitude === 12.9719 || locationHook.coords?.latitude === 12.9743 || locationHook.coords?.latitude === 12.9815 || locationHook.coords?.latitude === 12.9620 ? 'Manual Preset' : 'GPS Sensor'}</strong></span>
                      <span>Accuracy: <strong className="text-emerald-600 font-extrabold">{locationHook.coords?.latitude === 12.9719 || locationHook.coords?.latitude === 12.9743 || locationHook.coords?.latitude === 12.9815 || locationHook.coords?.latitude === 12.9620 ? 'Approximate (Preset)' : 'High (± 5m)'}</strong></span>
                    </div>

                    <button
                      type="button"
                      onClick={locationHook.fetchLocation}
                      className="text-xs text-primary-blue hover:text-primary-dark font-black flex items-center gap-1.5 cursor-pointer pt-1 bg-transparent border-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Re-detect Location
                    </button>
                  </div>
                )}
              </Card>
            </div>
          </div>

          <style>{`
            .leaflet-container {
              font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
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
            .custom-report-icon {
              background: transparent !important;
              border: none !important;
            }
          `}</style>

          {locationHook.coords && (
            <Card className="p-4 border-slate-100 shadow-sm relative space-y-3 animate-fadeIn">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                🗺️ Location Map Picker (Drag pin or click map to refine location)
              </span>
              <div className="aspect-[16/9] sm:aspect-[21/9] bg-slate-100 rounded-2xl border border-slate-200/80 overflow-hidden relative">
                <div ref={reportMapContainerRef} className="w-full h-full z-0" />
              </div>
            </Card>
          )}

          <Card className="p-5 border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Voice or Text Notes (Optional)</span>
              {speechHook.supported && (
                <button
                  type="button"
                  onClick={() => {
                    setTypeManually(!typeManually);
                    speechHook.resetTranscript();
                  }}
                  className="text-xs font-bold text-primary-blue hover:underline cursor-pointer border-0 bg-transparent"
                >
                  {typeManually ? 'Use Voice Input' : 'Type Instead'}
                </button>
              )}
            </div>

            {typeManually || !speechHook.supported ? (
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Briefly explain what you saw (e.g., Water main pipe burst on the corner sidewalk)."
                className="w-full min-h-[100px] border border-slate-200/80 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue text-slate-800"
              />
            ) : (
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100 text-center gap-3">
                <button
                  type="button"
                  onClick={handleMicToggle}
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer border-0 ${
                    speechHook.isListening 
                      ? 'bg-danger-red text-white animate-pulse shadow-rose-500/20' 
                      : 'bg-primary-blue hover:bg-primary-dark text-white'
                  }`}
                >
                  {speechHook.isListening ? <MicOff className="w-6 h-6 animate-pulse" /> : <Mic className="w-6 h-6" />}
                </button>
                <div>
                  <h4 className="text-sm font-bold text-slate-700">
                    {speechHook.isListening ? 'Listening... Speak now' : 'Tap to Speak'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-xs mx-auto min-h-[16px]">
                    {speechHook.transcript ? `"${speechHook.transcript}"` : 'AI will automatically transcribe your voice description.'}
                  </p>
                </div>
                
                {speechHook.error && (
                  <p className="text-xs text-rose-500 font-semibold">{speechHook.error}</p>
                )}
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full justify-center select-none cursor-pointer"
              onClick={handleReset}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full justify-center gap-2 select-none cursor-pointer"
              onClick={handleSubmit}
              disabled={isSubmitting || (!locationHook.coords && !locationHook.address)}
            >
              ⚡ Submit Quick Report
            </Button>
          </div>
        </div>
      )}

      {/* Step 2.5: AI Sequential Pipeline Loader */}
      {step === 2.5 && !lowConfidenceData && (
        <div className="space-y-8 animate-fadeIn py-6 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-primary-blue mx-auto shadow-md animate-pulse">
            <Brain className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 font-title flex items-center justify-center gap-1.5">
              <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
              AI Decision Pipeline
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              Multiple AI agents are processing your report sequentially. Please hold.
            </p>
          </div>

          {/* Steps Display */}
          <Card className="border-slate-100 p-5 shadow-premium rounded-3xl text-left divide-y divide-slate-150/60 bg-white">
            {aiStages.map((stage, idx) => {
              const isActive = aiStage === idx;
              const isDone = aiStage > idx;
              
              // Define dynamic classes based on status
              const containerClass = isDone 
                ? 'bg-emerald-50/40 text-emerald-800 border-emerald-100/50' 
                : isActive 
                  ? 'bg-blue-50/70 border-blue-150 text-blue-700 shadow-sm ring-2 ring-blue-50/50 animate-pulse' 
                  : 'bg-slate-50/30 text-slate-400 border-slate-100 opacity-60';
              
              const textClass = isActive 
                ? 'text-primary-blue font-extrabold' 
                : isDone 
                  ? 'text-slate-855 font-bold' 
                  : 'text-slate-400 font-medium';

              return (
                <div key={idx} className={`flex items-center justify-between p-3.5 my-1.5 rounded-2xl border transition-all duration-300 ${containerClass}`}>
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Circle icon container */}
                    <div className="w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 border bg-white shadow-sm">
                      {isDone ? (
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 fill-emerald-50/20" />
                      ) : (
                        getStageIcon(stage.icon, isActive ? 'text-primary-blue animate-pulse' : 'text-slate-400')
                      )}
                    </div>
                    
                    <div className="min-w-0 text-left">
                      <h4 className={`text-xs uppercase tracking-wider ${textClass}`}>
                        {stage.name}
                      </h4>
                      {(isActive || isDone) && (
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug font-medium">
                          {isDone ? 'Process completed successfully.' : stage.desc}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right hand progress indicator */}
                  <div className="shrink-0 pl-2">
                    {isActive ? (
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : isDone ? (
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        OK
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-slate-350 bg-slate-100/50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* Low Confidence Clarification Step */}
      {lowConfidenceData && (
        <div className="space-y-6 animate-fadeIn py-6 max-w-md mx-auto text-center">
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-3xl text-amber-600 inline-flex justify-center mb-2 shadow-sm">
            <AlertTriangle className="w-12 h-12" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 font-title">Clarification Required</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Our Vision Agent detected low confidence in classifying the issue. Please select what best matches this problem:
            </p>
          </div>

          {/* Large preset buttons */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {[
              { id: 'Road', label: 'Road Pit / Pothole', icon: '🚧' },
              { id: 'Water', label: 'Water Leakage', icon: '💧' },
              { id: 'Garbage', label: 'Garbage Dump', icon: '🗑️' },
              { id: 'Streetlight', label: 'Broken Lamp', icon: '💡' }
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleClarification(opt.id)}
                className="p-5 bg-white border border-slate-200 hover:border-primary-blue hover:bg-primary-light/10 rounded-2xl shadow-sm text-center select-none cursor-pointer flex flex-col items-center justify-center gap-2 group transition-all"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">{opt.icon}</span>
                <span className="text-xs font-bold text-slate-700 group-hover:text-primary-blue">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Success Screen */}
      {step === 3 && submitResult && (
        <div className="text-center space-y-6 animate-fadeIn py-8 max-w-sm mx-auto">
          <div className="p-4 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-3xl inline-flex items-center justify-center mb-2 shadow-sm">
            <CheckCircle2 className="w-14 h-14" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-title">Report Submitted Successfully</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Your issue has been logged. AI has verified, categorized, and dispatched it directly to departments.
            </p>
          </div>

          {/* Short AI Report Summary */}
          {submitResult.aiAnalysis?.summary && (
            <div className="p-4 border-2 border-indigo-150/60 bg-gradient-to-br from-indigo-50/20 via-white to-slate-50/30 shadow-sm rounded-2xl text-left space-y-1.5 ring-4 ring-indigo-50/15">
              <span className="text-[9px] font-black text-indigo-650 uppercase tracking-widest block bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100/30 w-fit">🤖 AI Vision & Routing Report</span>
              <p className="text-[11px] text-slate-650 leading-relaxed font-semibold">
                {submitResult.aiAnalysis.summary}
              </p>
            </div>
          )}

          {/* Ticket Information Card */}
          <Card className="p-4 border-slate-100 shadow-sm bg-slate-50/50 flex flex-col gap-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold uppercase">Tracking ID</span>
              <span className="font-mono font-bold text-slate-700">{submitResult.trackingId}</span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold uppercase">Category</span>
              <span className="font-semibold text-slate-700 capitalize">{submitResult.aiAnalysis?.category || 'Awaiting'}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold uppercase">Priority</span>
              <Badge status={submitResult.aiAnalysis?.severity || 'Low'} />
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold uppercase">Department</span>
              <span className="font-semibold text-slate-700">{submitResult.aiAnalysis?.department || 'Awaiting'}</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-semibold uppercase">Current Status</span>
              <Badge status="AI Verified" />
            </div>
          </Card>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              type="button"
              variant="primary"
              size="md"
              className="w-full justify-center flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/timeline')}
            >
              <FileText className="w-4 h-4 font-bold" />
              View Civic Timeline
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="w-full justify-center flex items-center gap-1.5 cursor-pointer"
                onClick={handleReset}
              >
                <Plus className="w-4 h-4 text-slate-700" />
                Report Another
              </Button>
              
              <Button
                type="button"
                variant="secondary"
                size="md"
                className="w-full justify-center flex items-center gap-1.5 border-slate-200 cursor-pointer"
                onClick={() => navigate('/home')}
              >
                <Home className="w-4 h-4 text-slate-600" />
                Go Home
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
