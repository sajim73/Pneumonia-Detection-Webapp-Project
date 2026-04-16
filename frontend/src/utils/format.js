export function formatPercent(value) {
  if (value == null) return 'N/A'
  return `${Number(value).toFixed(2)}%`
}

export function formatDate(dateString) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}
