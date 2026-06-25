// Full 48-nation field for the 2026 World Cup (across all confederations),
// sorted alphabetically for the picker. Colors for the original seed-data teams
// are preserved so existing pins keep their look.
export const teams = [
  { name: 'Algeria', flag: '🇩🇿', color: '#006233' },
  { name: 'Argentina', flag: '🇦🇷', color: '#74ACDF' },
  { name: 'Australia', flag: '🇦🇺', color: '#00843D' },
  { name: 'Austria', flag: '🇦🇹', color: '#ED2939' },
  { name: 'Belgium', flag: '🇧🇪', color: '#FDDA24' },
  { name: 'Brazil', flag: '🇧🇷', color: '#009C3B' },
  { name: 'Cameroon', flag: '🇨🇲', color: '#007A5E' },
  { name: 'Canada', flag: '🇨🇦', color: '#FF0000' },
  { name: 'Colombia', flag: '🇨🇴', color: '#FCD116' },
  { name: 'Costa Rica', flag: '🇨🇷', color: '#002B7F' },
  { name: 'Croatia', flag: '🇭🇷', color: '#FF0000' },
  { name: 'Denmark', flag: '🇩🇰', color: '#C60C30' },
  { name: 'Ecuador', flag: '🇪🇨', color: '#FFD100' },
  { name: 'Egypt', flag: '🇪🇬', color: '#CE1126' },
  { name: 'England', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', color: '#CF091B' },
  { name: 'France', flag: '🇫🇷', color: '#0055A4' },
  { name: 'Germany', flag: '🇩🇪', color: '#000000' },
  { name: 'Ghana', flag: '🇬🇭', color: '#006B3F' },
  { name: 'Iran', flag: '🇮🇷', color: '#239F40' },
  { name: 'Italy', flag: '🇮🇹', color: '#0066CC' },
  { name: 'Ivory Coast', flag: '🇨🇮', color: '#FF8200' },
  { name: 'Japan', flag: '🇯🇵', color: '#BC002D' },
  { name: 'Jordan', flag: '🇯🇴', color: '#007A3D' },
  { name: 'Mexico', flag: '🇲🇽', color: '#006847' },
  { name: 'Morocco', flag: '🇲🇦', color: '#C1272D' },
  { name: 'Netherlands', flag: '🇳🇱', color: '#FF6600' },
  { name: 'New Zealand', flag: '🇳🇿', color: '#000000' },
  { name: 'Nigeria', flag: '🇳🇬', color: '#008751' },
  { name: 'Norway', flag: '🇳🇴', color: '#BA0C2F' },
  { name: 'Panama', flag: '🇵🇦', color: '#005293' },
  { name: 'Paraguay', flag: '🇵🇾', color: '#D52B1E' },
  { name: 'Poland', flag: '🇵🇱', color: '#DC143C' },
  { name: 'Portugal', flag: '🇵🇹', color: '#006600' },
  { name: 'Qatar', flag: '🇶🇦', color: '#8A1538' },
  { name: 'Saudi Arabia', flag: '🇸🇦', color: '#006C35' },
  { name: 'Scotland', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', color: '#005EB8' },
  { name: 'Senegal', flag: '🇸🇳', color: '#00853F' },
  { name: 'South Africa', flag: '🇿🇦', color: '#007A4D' },
  { name: 'South Korea', flag: '🇰🇷', color: '#CD2E3A' },
  { name: 'Spain', flag: '🇪🇸', color: '#AA151B' },
  { name: 'Switzerland', flag: '🇨🇭', color: '#FF0000' },
  { name: 'Tunisia', flag: '🇹🇳', color: '#E70013' },
  { name: 'Turkey', flag: '🇹🇷', color: '#E30A17' },
  { name: 'USA', flag: '🇺🇸', color: '#B22234' },
  { name: 'Uruguay', flag: '🇺🇾', color: '#0038A8' },
  { name: 'Uzbekistan', flag: '🇺🇿', color: '#1EB53A' },
  { name: 'Venezuela', flag: '🇻🇪', color: '#CF142B' },
  { name: 'Wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', color: '#C8102E' },
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
