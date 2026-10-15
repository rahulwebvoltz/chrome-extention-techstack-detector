const MAX_VALUE_LENGTH = 120;

const truncate = (s) => (s.length > MAX_VALUE_LENGTH ? `${s.slice(0, MAX_VALUE_LENGTH - 1)}…` : s);

// One piece of proof shown to the user: "why do we think this is React?"
export function createEvidence({ type, key = null, value, weight }) {
  return { type, key, value: truncate(String(value)), weight };
}
