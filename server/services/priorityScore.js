/**
 * Dynamically calculates a Priority Score between 0 and 100.
 * Combines AI severity, community validation count, personal experiences, and recency.
 * 
 * @param {string} severity 'Critical' | 'High' | 'Medium' | 'Low'
 * @param {number} verificationCount Number of community verifications
 * @param {number} experiencedCount Number of experienced reports
 * @param {string|Date} createdAt Creation timestamp of the report
 * @returns {number} Priority Score (0–100)
 */
export const calculatePriorityScore = (severity, verificationCount = 0, experiencedCount = 0, createdAt = new Date()) => {
  let score = 0;
  
  // 1. AI Severity Contribution (Max 50 points)
  const severityPoints = { 
    Critical: 50, 
    High: 40, 
    Medium: 25, 
    Low: 10 
  };
  score += severityPoints[severity] || 10;
  
  // 2. Community Verifications (Max 30 points)
  // Each verification confirms validity and adds 10 points
  score += Math.min((verificationCount || 0) * 10, 30);
  
  // 3. Experienced Citizens (Max 10 points)
  // Each experienced report adds 5 points
  score += Math.min((experiencedCount || 0) * 5, 10);
  
  // 4. Report Recency (Max 10 points)
  // Give extra priority weight to recently reported issues to prevent aging delays
  const reportDate = createdAt ? new Date(createdAt) : new Date();
  const ageMs = Date.now() - reportDate.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  
  if (ageHours <= 24) {
    score += 10; // Reported within 24 hours
  } else if (ageHours <= 48) {
    score += 5;  // Reported within 48 hours
  }
  
  return Math.min(score, 100);
};

/**
 * Calculates a standard Impact Score representing community impact.
 * 
 * @param {string} severity 'Critical' | 'High' | 'Medium' | 'Low'
 * @param {number} verificationCount Number of community verifications
 * @param {number} experiencedCount Number of experienced reports
 * @param {number} evidenceCount Number of evidence images
 * @param {string|Date} createdAt Creation timestamp of the report
 * @returns {number} Impact Score (0-100)
 */
export const calculateImpactScore = (severity, verificationCount = 0, experiencedCount = 0, evidenceCount = 0, createdAt = new Date()) => {
  let score = 0;
  
  // 1. AI Severity Contribution (Max 40 points)
  const severityPoints = { 
    Critical: 40, 
    High: 30, 
    Medium: 15, 
    Low: 5 
  };
  score += severityPoints[severity] || 5;
  
  // 2. Verified Citizens (Max 30 points)
  score += Math.min((verificationCount || 0) * 10, 30);
  
  // 3. Experienced Citizens (Max 20 points)
  score += Math.min((experiencedCount || 0) * 5, 20);
  
  // 4. Evidence Images (Max 10 points)
  score += Math.min((evidenceCount || 0) * 5, 10);
  
  // 5. Recency (Max 10 points)
  const reportDate = createdAt ? new Date(createdAt) : new Date();
  const ageMs = Date.now() - reportDate.getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  if (ageHours <= 24) {
    score += 10;
  } else if (ageHours <= 48) {
    score += 5;
  }

  return Math.min(score, 100);
};

/**
 * Dynamically resolves confidence score with asymptotic growth.
 */
export const calculateUpdatedConfidence = (initialConfidence = 70, verificationCount = 0) => {
  if (verificationCount <= 0) return initialConfidence;
  const remaining = 100 - initialConfidence;
  const boost = remaining * (1 - Math.pow(0.7, verificationCount));
  return Math.min(Math.round(initialConfidence + boost), 100);
};

/**
 * Ranks priority levels dynamically based on score.
 */
export const getPriorityLevel = (priorityScore) => {
  if (priorityScore >= 80) return 'Critical';
  if (priorityScore >= 60) return 'High';
  if (priorityScore >= 40) return 'Medium';
  return 'Low';
};
