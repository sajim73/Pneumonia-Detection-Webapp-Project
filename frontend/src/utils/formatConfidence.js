export function formatConfidence(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "0.00%";
  return `${(num * 100).toFixed(2)}%`;
}
