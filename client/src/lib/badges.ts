export interface UserBadge {
  name: string;
  iconName: string;
  minPoints: number;
  color: string;
}

export const BADGES: UserBadge[] = [
  { name: "Početnik", iconName: "Sprout", minPoints: 0, color: "bg-gray-100 text-gray-700 border-gray-300" },
  { name: "Čitač", iconName: "BookOpen", minPoints: 100, color: "bg-blue-100 text-blue-700 border-blue-300" },
  { name: "Knjigoljubac", iconName: "Library", minPoints: 500, color: "bg-green-100 text-green-700 border-green-300" },
  { name: "Znalac", iconName: "GraduationCap", minPoints: 1000, color: "bg-purple-100 text-purple-700 border-purple-300" },
  { name: "Stručnjak", iconName: "Star", minPoints: 2000, color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { name: "Maestro", iconName: "Crown", minPoints: 5000, color: "bg-orange-100 text-orange-700 border-orange-300" },
];

export function getCurrentBadge(points: number): UserBadge {
  let current = BADGES[0];
  for (const badge of BADGES) {
    if (points >= badge.minPoints) {
      current = badge;
    }
  }
  return current;
}

export function getNextBadge(points: number): UserBadge | null {
  for (const badge of BADGES) {
    if (points < badge.minPoints) {
      return badge;
    }
  }
  return null;
}

export function getAllEarnedBadges(points: number): UserBadge[] {
  return BADGES.filter(b => points >= b.minPoints);
}
