import { ProduceBatch } from "@/types";

/**
 * Agro-Score Algorithm v1.0
 * 
 * Logic:
 * - Base Score: 500
 * - Tonnage Bonus: +5 points per 100kg delivered
 * - Grade A Bonus: +2 points per batch
 * - Quality Rejection Penalty: -20 points per "REJECTED" audit status
 * - Consistency Bonus: +10 points if 3+ batches delivered in last 30 days
 * 
 * Max Score: 850 (Excellent)
 * Min Score: 300 (Poor)
 */
export function calculateAgroScore(batches: ProduceBatch[]) {
  let score = 500;

  if (batches.length === 0) return score;

  const totalTonnageKg = batches.reduce((sum, b) => sum + b.weightKg, 0);
  const gradeABatches = batches.filter(b => b.grade === "A").length;
  const rejectedBatches = batches.filter(b => b.auditStatus === "REJECTED").length;

  // Tonnage points
  score += Math.floor(totalTonnageKg / 100) * 5;

  // Grade A points
  score += gradeABatches * 2;

  // Rejection penalty
  score -= rejectedBatches * 20;

  // Consistency (simple check)
  if (batches.length >= 3) {
    score += 10;
  }

  // Clamping
  return Math.min(850, Math.max(300, score));
}

export function getScoreRating(score: number) {
  if (score >= 750) return { label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-100" };
  if (score >= 650) return { label: "Good", color: "text-primary", bg: "bg-primary-light" };
  if (score >= 550) return { label: "Fair", color: "text-amber-600", bg: "bg-amber-100" };
  return { label: "Poor", color: "text-danger", bg: "bg-danger-light" };
}
