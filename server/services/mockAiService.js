/**
 * Mock implementation of the AI Decision Pipeline.
 * Used when GEMINI_API_KEY is not configured or queries fail.
 */
export const runMockAIDecisionPipeline = async (
  imageBuffer,
  mimeType,
  description,
  filename,
  location,
  nearbyIssues = [],
  clarificationCategory = null
) => {
  console.log('[Mock AI Pipeline] Running mock analysis...');

  // Normalize description
  const descLower = (description || '').toLowerCase().trim();

  // 1. Vision Agent stage simulation
  // Trigger low confidence if description contains "low" or is empty (and no clarification has been submitted yet)
  const isLowConfidence = descLower.includes('low') || descLower.length < 5 || (descLower === '' && !clarificationCategory);

  const visualDescription = descLower.length > 0 
    ? `Visual verification of the reported issue: "${description}"` 
    : 'A photo depicting an unidentified object or landscape in the neighborhood.';

  if (isLowConfidence && !clarificationCategory) {
    console.log('[Mock AI Pipeline] Low confidence triggered. Halting for user clarification.');
    return {
      lowConfidenceTrigger: true,
      visualDescription: 'Ambigious or unclear community issue image.'
    };
  }

  // 2. Categorization Agent stage simulation
  let category = 'Other';
  let confidence = 85;

  if (clarificationCategory) {
    category = clarificationCategory;
    confidence = 100;
    console.log(`[Mock AI Pipeline] Using user clarification category: ${category}`);
  } else {
    if (descLower.includes('pothole') || descLower.includes('road') || descLower.includes('asphalt') || descLower.includes('street') || descLower.includes('cracks')) {
      category = 'Road Damage';
    } else if (descLower.includes('leak') || descLower.includes('water') || descLower.includes('pipe') || descLower.includes('burst') || descLower.includes('flooding')) {
      category = 'Water Leakage';
    } else if (descLower.includes('garbage') || descLower.includes('trash') || descLower.includes('waste') || descLower.includes('dump') || descLower.includes('rubbish') || descLower.includes('litter')) {
      category = 'Garbage';
    } else if (descLower.includes('light') || descLower.includes('lamp') || descLower.includes('street-light') || descLower.includes('dark') || descLower.includes('bulb')) {
      category = 'Streetlight';
    } else if (descLower.includes('drain') || descLower.includes('sewer') || descLower.includes('overflow') || descLower.includes('drainage') || descLower.includes('gutter')) {
      category = 'Drainage';
    } else if (descLower.includes('park') || descLower.includes('bench') || descLower.includes('fence') || descLower.includes('vandalism') || descLower.includes('broken sign') || descLower.includes('property')) {
      category = 'Public Property Damage';
    } else if (descLower.includes('dumping') || descLower.includes('illegal') || descLower.includes('waste disposal') || descLower.includes('truck dumping')) {
      category = 'Illegal Dumping';
    }
  }

  // 3. Priority Agent stage simulation
  let severity = 'Medium';
  let urgencyReason = 'Standard maintenance review required.';

  if (descLower.includes('hazard') || descLower.includes('danger') || descLower.includes('accident') || descLower.includes('injury') || descLower.includes('severe') || descLower.includes('flood') || descLower.includes('critical') || descLower.includes('blocking')) {
    severity = 'Critical';
    urgencyReason = 'Poses an immediate public safety threat and risks causing accidents.';
  } else if (descLower.includes('broken') || descLower.includes('burst') || descLower.includes('blocked') || descLower.includes('high')) {
    severity = 'High';
    urgencyReason = 'Affects daily neighborhood functionality and public health.';
  } else if (descLower.includes('annoying') || descLower.includes('smell') || descLower.includes('dirty') || descLower.includes('medium')) {
    severity = 'Medium';
    urgencyReason = 'Standard community impact, needs correction in upcoming cycle.';
  } else {
    severity = 'Low';
    urgencyReason = 'Minor cosmetic or low priority maintenance issue.';
  }

  // 4. Routing Agent stage simulation
  let department = 'Municipality';
  let routingReason = 'Dispatched to general municipality team.';

  if (category === 'Road Damage') {
    department = 'Roads';
    routingReason = 'Assigned to Roads and Infrastructure Division for resurfacing and repair.';
  } else if (category === 'Water Leakage' || category === 'Drainage') {
    department = 'Water Supply';
    routingReason = 'Assigned to Water and Sewerage Board for leak plug or sewer clearance.';
  } else if (category === 'Garbage' || category === 'Illegal Dumping') {
    department = 'Sanitation';
    routingReason = 'Assigned to Solid Waste Management & Sanitation team for cleanup.';
  } else if (category === 'Streetlight') {
    department = 'Electricity';
    routingReason = 'Assigned to Electrical Department/Public Lighting maintenance team.';
  } else if (category === 'Public Property Damage' || category === 'Other') {
    department = 'Municipality';
    routingReason = 'Assigned to Municipality Public Works department.';
  }

  // 5. Duplicate Detection Agent stage simulation
  let duplicate = false;
  let existingIssueId = null;

  if (location && location.latitude && location.longitude && Array.isArray(nearbyIssues)) {
    for (const other of nearbyIssues) {
      // Check duplicate only for active/verified issues of same category
      if (other.aiAnalysis && other.aiAnalysis.category === category) {
        const otherLoc = other.location;
        if (otherLoc && otherLoc.latitude && otherLoc.longitude) {
          const latDiff = Math.abs(otherLoc.latitude - location.latitude);
          const lngDiff = Math.abs(otherLoc.longitude - location.longitude);
          // If within roughly 300 meters (~0.003 degrees)
          if (latDiff < 0.003 && lngDiff < 0.003) {
            duplicate = true;
            existingIssueId = other.issueId || other.trackingId || 'Unknown';
            console.log(`[Mock AI Pipeline] Duplicate detected: matching issue ${existingIssueId}`);
            break;
          }
        }
      }
    }
  }

  // 6. Summary Agent stage simulation
  const summary = `Official Report Summary: A ${severity.toLowerCase()}-priority ${category.toLowerCase()} issue was reported at ${location?.address || 'local coordinates'}. Description: "${description || 'No notes provided'}" is verified visually. Routed to ${department} department.`;

  return {
    lowConfidenceTrigger: false,
    visualDescription,
    category,
    severity,
    department,
    confidence,
    summary,
    duplicate,
    existingIssueId,
    routingReason,
    urgencyReason
  };
};
