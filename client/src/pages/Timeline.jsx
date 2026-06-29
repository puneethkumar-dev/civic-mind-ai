import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFirestoreListener } from '../hooks/useFirestoreListener';
import { updateLocalIssue } from '../services/firestoreService';
import { MapPin, CheckCircle2, Clock, Sparkles, FileText, Info, ShieldCheck, ShieldAlert, AlertTriangle, Wrench, Camera } from 'lucide-react';
import { storageService } from '../services/storageService';
import { auth } from '../services/firebaseConfig';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

export default function Timeline() {
  const navigate = useNavigate();
  const { user, updateUserPoints } = useAuth();

  // Listen to all issues in real-time
  const allReports = useFirestoreListener();
  
  // Filter sidebar to show only issues filed by the logged-in user
  const userReports = allReports.filter(r => r.reportedBy?.uid === user?.uid);

  const [activeReportId, setActiveReportId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Read issue ID query parameter if navigated from home page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryId = params.get('id');
    if (queryId) {
      setActiveReportId(queryId);
    }
  }, []);

  useEffect(() => {
    if (allReports) {
      setLoading(false);
      if (allReports.length > 0 && !activeReportId) {
        // Default to user's first report if available, else first general report
        if (userReports.length > 0) {
          setActiveReportId(userReports[0].issueId);
        } else {
          setActiveReportId(allReports[0].issueId);
        }
      }
    }
  }, [allReports, activeReportId, userReports]);

  const activeReport = allReports.find(r => r.issueId === activeReportId);

  const getImageUrl = (imageRef, category = 'Other') => {
    if (!imageRef || imageRef.startsWith('blob:')) {
      const map = {
        'Road Damage': 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=500&q=80',
        'Water Leakage': 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&q=80',
        'Garbage': 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=500&q=80',
        'Streetlight': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&q=80'
      };
      return map[category] || 'https://images.unsplash.com/photo-1594913785162-e6785382d365?w=500&q=80';
    }
    return imageRef;
  };

  const getIssueTitle = (report) => {
    if (!report.description) return 'Unnamed Quick Report';
    return report.description.substring(0, 35) + (report.description.length > 35 ? '...' : '');
  };

  const getTimelineIcon = (title) => {
    const t = (title || '').toLowerCase();
    if (t.includes('reported') || t.includes('submitted')) return FileText;
    if (t.includes('ai analysis') || (t.includes('verified') && t.includes('ai'))) return Sparkles;
    if (t.includes('priority')) return AlertTriangle;
    if (t.includes('department') || t.includes('assigned')) return ShieldAlert;
    if (t.includes('community verified') || t.includes('community-verified')) return ShieldCheck;
    if (t.includes('work started') || t.includes('maintenance') || t.includes('started')) return Wrench;
    if (t.includes('resolved') || t.includes('complete')) return CheckCircle2;
    return Clock;
  };

  const getTimelineSteps = (report) => {
    if (report.timeline && report.timeline.length > 0) {
      return report.timeline.map((step, index) => {
        const isLast = index === report.timeline.length - 1;
        const dateObj = new Date(step.timestamp);
        const formattedDate = isNaN(dateObj.getTime()) 
          ? '' 
          : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + 
            dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
             
        return {
          title: step.title,
          date: formattedDate,
          desc: step.description,
          status: isLast ? 'active' : 'done'
        };
      });
    }
    return [];
  };

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Close toast automatically after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Verification state computations (Module 5)
  const isOwnReport = activeReport?.reportedBy?.uid === user?.uid;
  const hasVerified = activeReport?.verifiedUsers?.includes(user?.uid) || false;
  const hasExperienced = activeReport?.experiencedUsers?.includes(user?.uid) || false;
  const hasNoLongerExists = activeReport?.noLongerExistsUsers?.includes(user?.uid) || false;

  const handleVerifyVote = async (voteType) => {
    if (!activeReport || !user) return;
    
    // 1. Check if user already voted (client-side safety check)
    const verification = activeReport.verification || { upvotes: 0, downvotes: 0, confidence: 0, voters: {} };
    if (verification.voters && verification.voters[user.uid]) {
      showToast('You have already voted on this issue.', 'error');
      return;
    }

    setIsActionLoading(true);

    // Optimistic UI updates
    const prevVerification = { ...verification };
    const updatedVoters = { ...(verification.voters || {}), [user.uid]: voteType };
    const updatedUpvotes = (verification.upvotes || 0) + (voteType === 'up' ? 1 : 0);
    const updatedDownvotes = (verification.downvotes || 0) + (voteType === 'down' ? 1 : 0);
    const updatedTotal = updatedUpvotes + updatedDownvotes;
    const updatedConfidence = updatedTotal === 0 ? 0 : Math.round((updatedUpvotes / updatedTotal) * 100);

    const optimisticVerification = {
      upvotes: updatedUpvotes,
      downvotes: updatedDownvotes,
      confidence: updatedConfidence,
      voters: updatedVoters
    };

    // Optimistically update the local copy of the issue so the UI updates immediately!
    updateLocalIssue(activeReport.issueId, null, null, { verification: optimisticVerification });

    try {
      const token = await auth.currentUser?.getIdToken();
      const isMockMode = !auth.currentUser || (user?.uid && user.uid.startsWith('mock-'));
      
      let data;
      if (isMockMode) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        data = {
          success: true,
          data: optimisticVerification
        };
      } else {
        const response = await fetch(`http://localhost:5000/api/issues/${activeReport.issueId}/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`
          },
          body: JSON.stringify({ vote: voteType })
        });
        
        if (response.status === 404) {
          throw new Error('Issue not found. It may have been deleted.');
        }
        
        data = await response.json();
      }

      if (data.success) {
        updateLocalIssue(activeReport.issueId, null, null, { verification: data.data });
        updateUserPoints(5);
        showToast('Your verification vote has been registered!', 'success');
      } else {
        // Rollback optimistic update
        updateLocalIssue(activeReport.issueId, null, null, { verification: prevVerification });
        showToast(data.message || 'Failed to record vote.', 'error');
      }
    } catch (err) {
      console.error('[Verify Vote Error]:', err);
      // Rollback optimistic update
      updateLocalIssue(activeReport.issueId, null, null, { verification: prevVerification });
      showToast(err.message || 'Network error recording vote. Please try again.', 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCivicAction = async (action, evidenceUrl = null) => {
    if (!activeReport || !user) return;
    setIsActionLoading(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`http://localhost:5000/api/issues/${activeReport.issueId}/action`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || 'mock-citizen'}`
        },
        body: JSON.stringify({ 
          action,
          userId: user.uid,
          evidenceUrl
        })
      });
      const data = await response.json();
      if (data.success) {
        updateLocalIssue(activeReport.issueId, data.data.aiAnalysis, data.data.timeline, {
          verifiedUsers: data.data.verifiedUsers,
          verificationCount: data.data.verificationCount,
          experiencedUsers: data.data.experiencedUsers,
          experiencedCount: data.data.experiencedCount,
          evidenceImages: data.data.evidenceImages,
          noLongerExistsUsers: data.data.noLongerExistsUsers,
          noLongerExistsCount: data.data.noLongerExistsCount,
          impactScore: data.data.impactScore,
          priorityScore: data.data.priorityScore,
          status: data.data.status,
          lastUpdated: data.data.lastUpdated
        });
      } else {
        showToast(data.message || `Failed to record action: ${action}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(`Network error recording action: ${action}`, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEvidenceUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !activeReport || !user) return;
    setIsActionLoading(true);
    try {
      const uploadPath = `evidence/${activeReport.issueId}/${Date.now()}_${file.name}`;
      const uploadRes = await storageService.uploadFile(uploadPath, file);
      if (uploadRes && uploadRes.url) {
        await handleCivicAction('evidence', uploadRes.url);
        showToast('Supporting evidence photo uploaded successfully!', 'success');
      } else {
        throw new Error('Upload failed.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error uploading evidence photo: ' + err.message, 'error');
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <LoadingState type="spinner" className="scale-110" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Civic Timeline" 
        subtitle="Track issue resolutions transparently. Each ticket tells the story of how our city is being maintained." 
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Ticket selector */}
        <div className="lg:col-span-5 space-y-4 w-full">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Your Filed Tickets</h3>
          <div className="space-y-3">
            {userReports.length > 0 ? (
              userReports.map((report) => (
                <Card
                  key={report.issueId}
                  onClick={() => setActiveReportId(report.issueId)}
                  hoverEffect={activeReportId !== report.issueId}
                  className={`border-l-4 transition-all w-full select-none cursor-pointer flex gap-4 p-4 ${
                    activeReportId === report.issueId
                      ? 'border-l-primary-blue bg-blue-50/10 shadow-md ring-1 ring-primary-blue/5'
                      : 'border-l-slate-200 hover:border-l-primary-blue/40'
                  }`}
                >
                  {/* Left Side: Thumbnail Attachment */}
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 relative shadow-sm">
                    <img 
                      src={getImageUrl(report.imageReference, report.aiAnalysis?.category || report.category)} 
                      alt="Attachment Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1594913785162-e6785382d365?w=100&q=80';
                      }}
                    />
                  </div>

                  {/* Right Side: Details */}
                  <div className="flex-1 min-w-0 space-y-1.5 text-left">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">{report.trackingId}</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {((report.verification?.confidence || 0) >= 50 || report.communityVerified) && (
                          <span className="text-[8px] font-black px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100/50 flex items-center gap-0.5 uppercase tracking-wider select-none shrink-0 font-sans">
                            🤝 Verified
                          </span>
                        )}
                        <Badge status={report.status} />
                      </div>
                    </div>
                    <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm line-clamp-1">{getIssueTitle(report)}</h4>
                    <p className="text-[10px] text-slate-500 line-clamp-1 flex items-center gap-0.5 font-medium">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      {report.location?.address || 'Captured Location'}
                    </p>
                    <div className="flex items-center justify-between pt-1.5 text-[9px] text-slate-400 font-bold border-t border-slate-50/50">
                      <span>
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </span>
                      {report.aiAnalysis?.category || report.category ? (
                        <span className="capitalize text-indigo-650 bg-indigo-50/50 px-2 py-0.5 rounded border border-indigo-100/30">
                          {report.aiAnalysis?.category || report.category}
                        </span>
                      ) : (
                        <span className="capitalize text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Awaiting AI</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed text-xs text-slate-400 font-semibold">
                You haven't filed any tickets yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Timeline Steps list */}
        <div className="lg:col-span-7 w-full">
          {activeReport ? (
            <Card className="p-6 border-slate-100 shadow-md space-y-5">
              {/* Header Details */}
              <div className="space-y-4 pb-6 border-b border-slate-100">
                <div className="flex justify-between items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-mono font-bold text-slate-400">{activeReport.trackingId}</span>
                    {activeReport.aiAnalysis?.severity ? (
                      <Badge status={activeReport.aiAnalysis.severity} />
                    ) : (
                      <Badge status="Awaiting AI" />
                    )}
                    {activeReport.aiAnalysis?.category && (
                      <Badge status={activeReport.aiAnalysis.category} />
                    )}
                    {activeReport.communityVerified && (
                      <Badge status="Community Verified" />
                    )}
                  </div>
                  <Badge status={activeReport.status} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-title">{getIssueTitle(activeReport)}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      {activeReport.location?.address || 'Captured Location'}
                    </span>
                    {activeReport.aiAnalysis?.department && (
                      <span className="flex items-center gap-1 text-slate-500 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span>Assigned to: <strong>{activeReport.aiAnalysis.department} Department</strong></span>
                      </span>
                    )}
                  </div>
                </div>
                {activeReport.imageReference && (
                  <div className="w-full max-h-[220px] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100/50 aspect-video relative flex items-center justify-center">
                    <img 
                      src={getImageUrl(activeReport.imageReference, activeReport.aiAnalysis?.category || activeReport.category)} 
                      alt="Issue Attachment" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1594913785162-e6785382d365?w=500&q=80';
                      }}
                    />
                  </div>
                )}
                <div className="space-y-3">
                  <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100/50">
                    <span className="block font-bold text-slate-700 mb-1">Citizen Description:</span>
                    {activeReport.description || 'No description notes provided.'}
                  </div>
                  {activeReport.aiAnalysis?.summary && (
                    <div className="bg-blue-50/20 border border-blue-100/30 p-3.5 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 font-title">
                        <Sparkles className="w-3.5 h-3.5 fill-current text-blue-500" />
                        <span>AI Official Summary</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {activeReport.aiAnalysis.summary}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Collaborative Validation Panel (Community Verification) */}
              <div className="bg-gradient-to-br from-indigo-50/60 via-white to-slate-50/50 border-2 border-indigo-200/80 p-4 sm:p-5 rounded-3xl space-y-5 shadow-md relative overflow-hidden ring-4 ring-indigo-50/30">
                {/* Glowing background accent */}
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-indigo-200/35 rounded-full blur-xl pointer-events-none" />
                
                <div className="flex justify-between items-center relative">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-indigo-750 uppercase tracking-widest bg-indigo-100/60 px-2.5 py-0.5 rounded-md border border-indigo-200/40">
                      ⚡ Community Verification
                    </span>
                  </div>
                  <div className="relative group shrink-0">
                    <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 cursor-help bg-white px-2 py-0.5 rounded border border-slate-200 transition-colors hover:bg-slate-50">
                      <Info className="w-3 h-3 text-slate-400" />
                      What is this?
                    </span>
                    <div className="absolute right-0 bottom-6 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2.5 rounded-xl shadow-lg w-56 z-30 leading-normal border border-slate-800 font-normal text-left">
                      Community members verify if reported issues are genuine. An issue must be verified by citizens to be validated.
                    </div>
                  </div>
                </div>
                
                {/* Metrics: upvotes, downvotes, confidence */}
                {(() => {
                  const verification = activeReport.verification || { upvotes: 0, downvotes: 0, confidence: 0, voters: {} };
                  const upvotes = verification.upvotes || 0;
                  const downvotes = verification.downvotes || 0;
                  const confidence = verification.confidence || 0;
                  const hasVoted = verification.voters && verification.voters[user?.uid];
                  const userVote = hasVoted ? verification.voters[user.uid] : null;

                  return (
                    <>
                      {/* Telemetry row */}
                      <div className="grid grid-cols-3 gap-2 text-left bg-white p-3 rounded-xl border border-slate-100 select-none">
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Verified Citizens</span>
                          <div className="flex items-baseline gap-1 text-emerald-600">
                            <span className="text-xl font-extrabold font-title">👍 {upvotes}</span>
                          </div>
                        </div>

                        <div className="space-y-1 border-x border-slate-100 px-2 sm:px-3">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Invalid Marks</span>
                          <div className="flex items-baseline gap-1 text-rose-500">
                            <span className="text-xl font-extrabold font-title">👎 {downvotes}</span>
                          </div>
                        </div>

                        <div className="space-y-1 pl-2 sm:pl-3">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Community Confidence</span>
                          <div className="flex items-baseline gap-0.5 text-slate-850">
                            <span className="text-xl font-extrabold font-title">{confidence}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Vote Buttons Row */}
                      <div className="space-y-2.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block text-left">Citizen Verification Choice</span>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Vote Up: Verify Issue */}
                          <button
                            type="button"
                            disabled={hasVoted || isActionLoading}
                            onClick={() => handleVerifyVote('up')}
                            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold border transition-all select-none min-h-[38px] cursor-pointer ${
                              userVote === 'up'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-not-allowed shadow-inner'
                                : hasVoted
                                  ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed opacity-50'
                                  : 'bg-emerald-600 hover:bg-emerald-750 text-white border-emerald-600 shadow-sm'
                            }`}
                          >
                            <ShieldCheck className="w-4 h-4" />
                            {userVote === 'up' ? 'Verified by You' : 'Verify Issue'}
                          </button>

                          {/* Vote Down: Mark as Invalid */}
                          <button
                            type="button"
                            disabled={hasVoted || isActionLoading}
                            onClick={() => handleVerifyVote('down')}
                            className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-xs font-bold border transition-all select-none min-h-[38px] cursor-pointer ${
                              userVote === 'down'
                                ? 'bg-rose-50 text-rose-700 border-rose-200 cursor-not-allowed shadow-inner'
                                : hasVoted
                                  ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed opacity-50'
                                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm'
                            }`}
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {userVote === 'down' ? 'Marked Invalid' : 'Mark as Invalid'}
                          </button>
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* Additional Evidence Gallery Upload Option */}
                <div className="border-t border-slate-100 pt-3 text-left space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Add Supporting Photos</span>
                    <label
                      className={`flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg text-[10px] font-bold border transition-all select-none cursor-pointer bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-sm ${
                        isActionLoading ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <Camera className="w-3 h-3" />
                      Upload Evidence
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleEvidenceUpload} 
                        className="hidden" 
                        disabled={isActionLoading}
                      />
                    </label>
                  </div>
                  
                  {activeReport.evidenceImages && activeReport.evidenceImages.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 max-h-[80px] scrollbar-thin">
                      {activeReport.evidenceImages.map((img, idx) => (
                        <a 
                          key={idx} 
                          href={img.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-14 h-14 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 hover:border-primary-blue transition-all"
                        >
                          <img 
                            src={img.url} 
                            alt={`Evidence ${idx + 1}`} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1594913785162-e6785382d365?w=100&q=80';
                            }}
                          />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Vertical Steps */}
              <div className="pt-4 relative pl-6 space-y-6">
                {/* Vertical line connector */}
                <div className="absolute left-[30px] top-8 bottom-8 w-0.5 bg-slate-100" />

                {getTimelineSteps(activeReport).map((step, idx) => {
                  const isDone = step.status === 'done';
                  const isActive = step.status === 'active';
                  const IconComponent = getTimelineIcon(step.title);
                  
                  return (
                    <div key={idx} className="relative flex items-start gap-4">
                      {/* Circle Pin indicator */}
                      <div className="absolute -left-[5px] mt-0.5 z-10 flex items-center justify-center">
                        {isDone ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                            <IconComponent className="w-2.5 h-2.5" />
                          </div>
                        ) : isActive ? (
                          <div className="w-4 h-4 rounded-full bg-primary-blue text-white flex items-center justify-center shadow-md animate-pulse">
                            <IconComponent className="w-2.5 h-2.5 fill-current text-amber-200" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center" />
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 bg-slate-50/30 border border-slate-100/50 p-4 rounded-2xl">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h4 className={`text-sm font-bold ${isActive ? 'text-primary-blue font-semibold' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                            {step.title}
                          </h4>
                          <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" />
                            {step.date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-505 mt-1.5 leading-relaxed text-slate-500">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed text-slate-400 font-semibold text-sm">
              Select a ticket to review timeline steps.
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-2.5 px-4.5 py-3 rounded-2xl shadow-xl border text-xs font-bold leading-normal select-none ${
              toast.type === 'error'
                ? 'bg-rose-50 border-rose-100 text-rose-700'
                : 'bg-emerald-50 border-emerald-100 text-emerald-700'
            }`}
          >
            {toast.type === 'error' ? '❌' : '✅'} {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
