export type LeadCategory = 'hot' | 'warm' | 'cold';

interface LeadFormData {
  intent_level?: string;
  timeline?: string;
  budget_range?: string;
  course_interest?: string;
  location?: string;
  whatsapp_number?: string;
  student_name?: string;
}

export function computeScore(data: LeadFormData): number {
  let score = 0;

  if (data.intent_level === 'Ready to enroll') score += 35;
  else if (data.intent_level === 'Exploring options') score += 20;
  else if (data.intent_level === 'Just curious') score += 5;

  if (data.timeline === 'This academic year') score += 25;
  else if (data.timeline === 'Next academic year') score += 15;
  else if (data.timeline === 'Just exploring') score += 5;

  if (data.budget_range === 'Above ₹5 Lakh') score += 20;
  else if (data.budget_range === '₹3–5 Lakh') score += 15;
  else if (data.budget_range === '₹1–3 Lakh') score += 10;
  else if (data.budget_range === 'Below ₹1 Lakh') score += 5;

  if (data.course_interest && data.course_interest.length > 0) score += 10;
  if (data.location && data.location.length > 0) score += 5;
  if (data.whatsapp_number && data.whatsapp_number.length >= 10) score += 5;

  return Math.min(score, 100);
}

export function getCategory(score: number): LeadCategory {
  if (score >= 70) return 'hot';
  if (score >= 40) return 'warm';
  return 'cold';
}

export function getCategoryLabel(score: number) {
  const cat = getCategory(score);
  if (cat === 'hot') return { label: 'Hot', className: 'bg-green-100 text-green-800' };
  if (cat === 'warm') return { label: 'Warm', className: 'bg-amber-100 text-amber-800' };
  return { label: 'Cold', className: 'bg-gray-100 text-gray-800' };
}

export function getScoreColor(score: number) {
  if (score >= 70) return 'text-green-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-gray-500';
}
