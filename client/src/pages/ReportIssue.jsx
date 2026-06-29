import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocation } from '../hooks/useLocation';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { storageService } from '../services/storageService';
import { createIssueDoc, updateLocalIssue } from '../services/firestoreService';
import { auth } from '../services/firebaseConfig';
import { Camera, Image as ImageIcon, Mic, MicOff, CheckCircle2, Loader2, FileText, Home, Plus, RefreshCw, Sparkles, Brain, AlertTriangle } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import Badge from '../components/Badge';
import PageHeader from '../components/PageHeader';
import { API_URL } from '../config/api';

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

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

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
    { name: 'Vision Agent', desc: 'Analyzing image details & identifying issue...' },
    { name: 'Categorization Agent', desc: 'Standardizing category rules...' },
    { name: 'Priority Agent', desc: 'Calculating safety severity levels...' },
    { name: 'Routing Agent', desc: 'Assigning responsible municipal division...' },
    { name: 'Duplicate Agent', desc: 'Scanning nearby reported issues...' },
    { name: 'Summary Agent', desc: 'Generating factual official summary logs...' }
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

          <div className="flex flex-col gap-5 pt-4">
            <button
              onClick={handleCameraStart}
              className="flex items-center gap-4 bg-primary-blue hover:bg-primary-dark text-white p-6 rounded-2xl shadow-premium hover:shadow-lg transition-all text-left min-h-[80px] w-full select-none cursor-pointer border-0"
            >
              <div className="p-3 bg-white/10 rounded-xl">
                <Camera className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-title leading-tight">Take Photo</h3>
                <p className="text-xs text-blue-100/80 mt-1">Capture the issue with your phone camera</p>
              </div>
            </button>

            <button
              onClick={() => triggerFileSelect(false)}
              className="flex items-center gap-4 bg-white hover:bg-slate-50 text-slate-800 p-6 rounded-2xl border border-slate-100/90 shadow-premium hover:shadow-lg transition-all text-left min-h-[80px] w-full select-none cursor-pointer"
            >
              <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
                <ImageIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-title leading-tight">Upload From Gallery</h3>
                <p className="text-xs text-slate-500 mt-1">Select an existing photo from device memory</p>
              </div>
            </button>
          </div>

          <div className="relative my-8 flex items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">Review Simulator</span>
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
              <Card className="flex-grow flex flex-col justify-center gap-3 border-slate-100 p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Location Status</span>
                
                {locationHook.loading ? (
                  <div className="flex items-center gap-2 text-xs text-primary-blue font-semibold animate-pulse py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Fetching GPS coordinates...
                  </div>
                ) : locationHook.error ? (
                  <div className="space-y-3">
                    <p className="text-xs text-danger-red font-medium leading-relaxed">
                      ❌ GPS failed: {locationHook.error}
                    </p>
                    <p className="text-[10px] text-slate-400">Please tap a neighborhood preset below to set location manually:</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {['Indiranagar', 'MG Road', 'Gandhi Nagar', 'Market Area'].map((hood) => (
                        <button
                          key={hood}
                          type="button"
                          onClick={() => locationHook.setManualLocation(hood)}
                          className="px-2.5 py-1 text-[10px] bg-slate-100 hover:bg-primary-light hover:text-primary-blue text-slate-600 rounded-full border border-slate-200/50 transition-colors cursor-pointer"
                        >
                          {hood}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                      📍 {locationHook.address}
                    </p>
                    {locationHook.coords && (
                      <p className="text-[10px] text-slate-400 font-mono">
                        Lat: {locationHook.coords.latitude.toFixed(6)}, Lng: {locationHook.coords.longitude.toFixed(6)}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={locationHook.fetchLocation}
                      className="text-[10px] text-primary-blue hover:underline font-bold flex items-center gap-1 cursor-pointer pt-1 border-0 bg-transparent"
                    >
                      <RefreshCw className="w-3 h-3" /> Re-detect Location
                    </button>
                  </div>
                )}
              </Card>
            </div>
          </div>

          <Card className="p-5 border-slate-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Voice or Text Notes (Optional)</span>
              {speechHook.supported && (
                <button
                  type="button"
                  onClick={() => {
                    setTypeManually(!typeManually);
                    speechHook.resetTranscript();
                  }}
                  className="text-[10px] font-bold text-primary-blue hover:underline cursor-pointer border-0 bg-transparent"
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
                className="w-full min-h-[100px] border border-slate-200/80 rounded-2xl p-4 text-xs focus:outline-none focus:ring-2 focus:ring-primary-blue/30 focus:border-primary-blue text-slate-800"
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
                  <h4 className="text-xs font-bold text-slate-700">
                    {speechHook.isListening ? 'Listening... Speak now' : 'Tap to Speak'}
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed max-w-xs mx-auto min-h-[16px]">
                    {speechHook.transcript ? `"${speechHook.transcript}"` : 'AI will automatically transcribe your voice description.'}
                  </p>
                </div>
                
                {speechHook.error && (
                  <p className="text-[10px] text-rose-500 font-semibold">{speechHook.error}</p>
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
          <Card className="border-slate-100 p-5 shadow-sm text-left divide-y divide-slate-50">
            {aiStages.map((stage, idx) => {
              const isActive = aiStage === idx;
              const isDone = aiStage > idx;
              return (
                <div key={idx} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="mt-0.5 shrink-0">
                    {isDone ? (
                      <span className="text-emerald-500 font-bold text-xs">✓</span>
                    ) : isActive ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-primary-blue" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-200 block bg-slate-50"></span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-xs font-bold ${isActive ? 'text-primary-blue' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                      {stage.name}
                    </h4>
                    {isActive && (
                      <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{stage.desc}</p>
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
