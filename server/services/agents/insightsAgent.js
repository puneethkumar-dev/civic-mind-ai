import { callGemini } from '../geminiClient.js';

/**
 * Stage 7: Insights Agent
 * Analyzes all reported issues and generates structured municipal insights for administrators.
 * 
 * @param {Array} issues List of all issues fetched from Firestore
 * @returns {Promise<{
 *   summary: string,
 *   topCategory: string,
 *   hotspot: string,
 *   highPriorityCount: number,
 *   mostBusyDepartment: string,
 *   recommendation: string,
 *   trend: string
 * }>}
 */
export const runInsightsAgent = async (issues) => {
  // Gracefully handle empty issues list
  if (!issues || issues.length === 0) {
    return getDeterministicInsights([]);
  }

  // Pre-summarize issues to avoid passing large data to Gemini and keep it optimal
  const summarizedIssues = issues.map(issue => ({
    category: issue.aiAnalysis?.category || issue.category || 'Other',
    priority: issue.aiAnalysis?.severity || issue.priority || 'Medium',
    department: issue.aiAnalysis?.department || issue.department || 'Municipality',
    address: issue.location?.address || 'Unknown Area',
    status: issue.status || 'Reported',
    createdAt: issue.createdAt
  }));

  const prompt = `Analyze the following municipal issues data and generate structured insights.
Issues Data:
${JSON.stringify(summarizedIssues, null, 2)}

Provide these insights:
1. "summary": A concise high-level description of what occurred recently (e.g., trend of complaints).
2. "topCategory": The standard category with the highest frequency of reports.
3. "hotspot": The ward, block, neighborhood, or street/location sector with the highest concentration of issues.
4. "highPriorityCount": The number of critical/high priority reports.
5. "mostBusyDepartment": The department assigned to the most reports.
6. "recommendation": A specific, actionable suggested municipal action for government officials (e.g., deploy teams to hotspot).
7. "trend": A description comparing these results to general/recent activity (e.g., pothole reports increased by 24%).

Output must be a valid JSON object matching this structure exactly:
{
  "summary": "High-level summary of city complaints and trends.",
  "topCategory": "Potholes",
  "hotspot": "Ward 5",
  "highPriorityCount": 12,
  "mostBusyDepartment": "Road Maintenance",
  "recommendation": "Deploy an additional maintenance team to Ward 5 within the next 48 hours.",
  "trend": "Pothole reports increased by approximately 24% compared to recent submissions."
}`;

  const systemInstruction = "You are the CivicMind AI Insights Agent. You analyze city issues and return structured insights for administrators in strict JSON format. Do not return any other text.";

  try {
    return await callGemini(prompt, systemInstruction);
  } catch (err) {
    console.warn('[Insights Agent] Gemini execution failed, falling back to deterministic calculations:', err.message);
    return getDeterministicInsights(issues);
  }
};

/**
 * Deterministic fallback logic to compute insights when Gemini fails or is disabled.
 */
export const getDeterministicInsights = (issues) => {
  if (!issues || issues.length === 0) {
    return {
      summary: "No municipal reports logged yet. The database is empty.",
      topCategory: "None",
      hotspot: "N/A",
      highPriorityCount: 0,
      mostBusyDepartment: "None",
      recommendation: "Keep monitoring incoming citizen filings.",
      trend: "No data available."
    };
  }

  const categoryCounts = {};
  const locationCounts = {};
  const departmentCounts = {};
  let highPriorityCount = 0;

  issues.forEach(i => {
    const cat = i.aiAnalysis?.category || i.category || 'Other';
    const loc = i.location?.address ? i.location.address.split(',')[0].trim() : 'Unknown Area';
    const dept = i.aiAnalysis?.department || i.department || 'Municipality';
    const prio = i.aiAnalysis?.severity || i.priority || 'Medium';

    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;

    if (prio === 'Critical' || prio === 'High') {
      highPriorityCount += 1;
    }
  });

  const getTop = (obj) => {
    let topKey = 'None';
    let max = 0;
    for (const [k, v] of Object.entries(obj)) {
      if (v > max && k !== 'Unknown Area') {
        max = v;
        topKey = k;
      }
    }
    return { name: topKey, count: max };
  };

  const topCat = getTop(categoryCounts);
  const topLoc = getTop(locationCounts);
  const topDept = getTop(departmentCounts);

  const hotspot = topLoc.name !== 'None' ? topLoc.name : 'Unknown Sector';

  return {
    summary: `Analyzed ${issues.length} active city report filings. Main focus is on ${topCat.name !== 'None' ? topCat.name.toLowerCase() : 'uncategorized'} issues.`,
    topCategory: topCat.name !== 'None' ? topCat.name : 'Other',
    hotspot: hotspot,
    highPriorityCount,
    mostBusyDepartment: topDept.name !== 'None' ? topDept.name : 'Municipality',
    recommendation: topLoc.name !== 'None' 
      ? `Deploy resource teams to inspect the concentrated reports logged near ${topLoc.name}.` 
      : "Ensure department queues are audited regularly.",
    trend: topCat.name !== 'None' 
      ? `${topCat.name} reports represent ${Math.round((topCat.count / issues.length) * 100)}% of all active complaints.`
      : "Report volume remains stable."
  };
};
