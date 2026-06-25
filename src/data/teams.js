export const teams = [
  { name: 'Argentina', flag: '🇦🇷', color: '#74ACDF' },
  { name: 'Brazil', flag: '🇧🇷', color: '#009C3B' },
  { name: 'France', flag: '🇫🇷', color: '#0055A4' },
  { name: 'Germany', flag: '🇩🇪', color: '#000000' },
  { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#CF091B' },
  { name: 'Spain', flag: '🇪🇸', color: '#AA151B' },
  { name: 'Mexico', flag: '🇲🇽', color: '#006847' },
  { name: 'USA', flag: '🇺🇸', color: '#B22234' },
  { name: 'Morocco', flag: '🇲🇦', color: '#C1272D' },
  { name: 'Senegal', flag: '🇸🇳', color: '#00853F' },
  { name: 'South Korea', flag: '🇰🇷', color: '#CD2E3A' },
  { name: 'Japan', flag: '🇯🇵', color: '#BC002D' },
  { name: 'Portugal', flag: '🇵🇹', color: '#006600' },
  { name: 'Netherlands', flag: '🇳🇱', color: '#FF6600' },
  { name: 'Colombia', flag: '🇨🇴', color: '#FCD116' },
]

// Lookup helpers used across the app (pin colors, flags in panels/filters).
const byName = new Map(teams.map((t) => [t.name, t]))

export function getTeam(name) {
  return byName.get(name)
}

export function getTeamColor(name) {
  return byName.get(name)?.color ?? '#1a7a1a'
}

export function getTeamFlag(name) {
  return byName.get(name)?.flag ?? '🏳️'
}
