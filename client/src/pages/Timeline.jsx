import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFirestoreListener } from '../hooks/useFirestoreListener';
import { updateLocalIssue } from '../services/firestoreService';
import { MapPin, CheckCircle2, Clock, Sparkles, FileText, Info, ShieldCheck, ShieldAlert, ThumbsUp, AlertTriangle, Wrench } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Badge from '../components/Badge';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

export default function Timeline() {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  // Verification & Upvoting state computations
  const isOwnReport = activeReport?.reportedBy?.uid === user?.uid;
  const hasVerified = activeReport?.verifiedUsers?.includes(user?.uid) || false;
  const hasSupported = activeReport?.supportedUsers?.includes(user?.uid) || false;

  const handleVerifyIssue = async () => {
    if (!activeReport || !user) return;
    setIsActionLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/issues/${activeReport.issueId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.uid,
          // Backup parameters for credentials-free fallback mode
          reportedBy: activeReport.reportedBy,
          verificationCount: activeReport.verificationCount || 0,
          verifiedUsers: activeReport.verifiedUsers || [],
          supportCount: activeReport.supportCount || 0,
          supportedUsers: activeReport.supportedUsers || [],
          aiAnalysis: activeReport.aiAnalysis,
          timeline: activeReport.timeline,
          createdAt: activeReport.createdAt
        })
      });
      const data = await response.json();
      if (data.success) {
        // Sync results to localStorage for real-time reactivity in the listener hook
        updateLocalIssue(activeReport.issueId, activeReport.aiAnalysis, data.data.timeline, {
          verificationCount: data.data.verificationCount,
          verifiedUsers: data.data.verifiedUsers,
          communityVerified: data.data.communityVerified,
          priorityScore: data.data.priorityScore,
          lastUpdated: data.data.lastUpdated
        });
      } else {
        alert(data.message || 'Failed to verify issue.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error verifying issue.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSupportIssue = async () => {
    if (!activeReport || !user) return;
    setIsActionLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/issues/${activeReport.issueId}/support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.uid,
          // Backup parameters for credentials-free fallback mode
          verificationCount: activeReport.verificationCount || 0,
          supportCount: activeReport.supportCount || 0,
          supportedUsers: activeReport.supportedUsers || [],
          aiAnalysis: activeReport.aiAnalysis,
          createdAt: activeReport.createdAt
        })
      });
      const data = await response.json();
      if (data.success) {
        // Sync results to localStorage for real-time reactivity in the listener hook
        updateLocalIssue(activeReport.issueId, activeReport.aiAnalysis, activeReport.timeline, {
          supportCount: data.data.supportCount,
          supportedUsers: data.data.supportedUsers,
          priorityScore: data.data.priorityScore,
          lastUpdated: data.data.lastUpdated
        });
      } else {
        alert(data.message || 'Failed to support issue.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error supporting issue.');
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
                  className={`border-l-4 transition-all w-full select-none cursor-pointer ${
                    activeReportId === report.issueId
                      ? 'border-l-primary-blue bg-blue-50/10 shadow-md ring-1 ring-primary-blue/5'
                      : 'border-l-slate-200 hover:border-l-primary-blue/40'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">{report.trackingId}</span>
                      <div className="flex items-center gap-1.5">
                        {report.communityVerified && (
                          <Badge status="Community Verified" className="scale-90" />
                        )}
                        <Badge status={report.status} />
                      </div>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{getIssueTitle(report)}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {report.location?.address || 'Captured Location'}
                    </p>
                    <div className="flex items-center justify-between pt-2 text-[10px] text-slate-400 font-semibold border-t border-slate-50">
                      <span>
                        {report.createdAt ? new Date(report.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                      </span>
                      {report.aiAnalysis?.category ? (
                        <span className="capitalize text-blue-600 bg-blue-50/50 px-2 py-0.5 rounded-full border border-blue-100/30">
                          {report.aiAnalysis.category}
                        </span>
                      ) : (
                        <span className="capitalize text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">Awaiting AI</span>
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
                    <img src={activeReport.imageReference} alt="Issue Attachment" className="w-full h-full object-cover" />
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

              {/* Smart Priority Score Panel */}
              <div className="bg-slate-50/80 border border-slate-200/50 p-4 rounded-2xl space-y-4">
                <div className="flex justify-between items-center relative">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Smart Priority Score</span>
                  <div className="relative group">
                    <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 cursor-help bg-white px-2 py-0.5 rounded border border-slate-200 transition-colors hover:bg-slate-50">
                      <Info className="w-3 h-3 text-slate-400" />
                      How is this calculated?
                    </span>
                    <div className="absolute right-0 bottom-6 hidden group-hover:block bg-slate-900 text-white text-[10px] p-2.5 rounded-xl shadow-lg w-52 z-30 leading-normal border border-slate-800 font-normal">
                      This score combines AI analysis and community validation to help authorities prioritize issues.
                    </div>
                  </div>
                </div>
                
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold text-slate-800 font-title">
                    {activeReport.priorityScore !== undefined ? activeReport.priorityScore : 25}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">/ 100</span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    type="button"
                    disabled={isOwnReport || hasVerified || isActionLoading}
                    onClick={handleVerifyIssue}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-all select-none min-h-[38px] ${
                      hasVerified
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-not-allowed'
                        : isOwnReport
                          ? 'bg-slate-50 text-slate-400 border-slate-200/70 cursor-not-allowed opacity-60'
                          : 'bg-primary-blue hover:bg-primary-dark text-white border-primary-blue cursor-pointer shadow-sm hover:shadow-md'
                    }`}
                  >
                    {hasVerified ? (
                      <>
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Verified ({activeReport.verificationCount || 0})
                      </>
                    ) : isOwnReport ? (
                      <>
                        <ShieldAlert className="w-4 h-4 text-slate-400" />
                        Self-Reported
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-white" />
                        Verify Issue ({activeReport.verificationCount || 0})
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={hasSupported || isActionLoading}
                    onClick={handleSupportIssue}
                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-all select-none min-h-[38px] ${
                      hasSupported
                        ? 'bg-blue-50 text-blue-700 border-blue-200 cursor-not-allowed'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 cursor-pointer shadow-sm hover:shadow-md'
                    }`}
                  >
                    {hasSupported ? (
                      <>
                        <ThumbsUp className="w-3.5 h-3.5 text-blue-600 fill-current" />
                        Supported ({activeReport.supportCount || 0})
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="w-3.5 h-3.5 text-slate-505" />
                        Support ({activeReport.supportCount || 0})
                      </>
                    )}
                  </button>
                </div>
                
                {isOwnReport && (
                  <p className="text-[9px] text-slate-400 font-semibold italic text-center leading-none">
                    * You cannot verify your own reports to ensure validation integrity.
                  </p>
                )}
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
    </div>
  );
}
