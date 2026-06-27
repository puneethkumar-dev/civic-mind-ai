/**
 * Client-side Priority Score calculator. Matches server calculations.
 * 
 * @param {string} severity 'Critical' | 'High' | 'Medium' | 'Low'
 * @param {number} verificationCount 
 * @param {number} supportCount 
 * @param {string|Date} createdAt 
 * @returns {number} Priority Score (0–100)
 */
export const calculatePriorityScore = (severity, verificationCount = 0, supportCount = 0, createdAt = new Date()) => {
  let score = 0;
  
  const severityPoints = { 
    Critical: 50, 
    High: 40, 
    Medium: 25, 
    Low: 10 
  };
  score += severityPoints[severity] || 10;
  
  score += Math.min((verificationCount || 0) * 10, 30);
  score += Math.min((supportCount || 0) * 2, 10);
  
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
