/**
 * Dynamically calculates a Priority Score between 0 and 100.
 * Combines AI severity, community validation count, upvotes, and recency of report.
 * 
 * @param {string} severity 'Critical' | 'High' | 'Medium' | 'Low'
 * @param {number} verificationCount Number of community verifications
 * @param {number} supportCount Number of upvotes / supports
 * @param {string|Date} createdAt Creation timestamp of the report
 * @returns {number} Priority Score (0–100)
 */
export const calculatePriorityScore = (severity, verificationCount = 0, supportCount = 0, createdAt = new Date()) => {
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
  
  // 3. Upvotes / Community Support (Max 10 points)
  // Each upvote adds 2 points representing general interest/consequence
  score += Math.min((supportCount || 0) * 2, 10);
  
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
