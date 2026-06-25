// Capacity indicator logic (brief §15):
//   ratio < 0.5  → 🟢 Spots open
//   ratio < 0.9  → 🟡 Filling up
//   ratio >= 0.9 → 🔴 Almost full
export function getCapacityStatus(rsvpCount, capacity) {
  const safeCapacity = capacity > 0 ? capacity : 1
  const ratio = rsvpCount / safeCapacity

  if (ratio >= 0.9) {
    return { level: 'full', label: 'Almost full', emoji: '🔴', color: '#e63946' }
  }
  if (ratio >= 0.5) {
    return { level: 'filling', label: 'Filling up', emoji: '🟡', color: '#f5a623' }
  }
  return { level: 'open', label: 'Spots open', emoji: '🟢', color: '#1a7a1a' }
}
