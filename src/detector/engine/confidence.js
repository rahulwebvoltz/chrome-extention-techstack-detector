// Independent signals add up; a single weak signal stays "possible" while
// several (or one very strong one) push a technology to "confirmed".
export function calculateConfidence(evidence) {
  const score = evidence.reduce((total, e) => total + e.weight, 0);
  return Math.min(Math.round(score), 100);
}

export const LEVELS = {
  confirmed: { label: "Confirmed", min: 80 },
  likely: { label: "Likely", min: 50 },
  possible: { label: "Possible", min: 0 }
};

export function confidenceLevel(confidence) {
  if (confidence >= LEVELS.confirmed.min) return "confirmed";
  if (confidence >= LEVELS.likely.min) return "likely";
  return "possible";
}
