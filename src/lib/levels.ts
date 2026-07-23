export const LEVELS = [
  { name: "STONE", minXp: 0, discount: 0, pointsMultiplier: 1 },
  { name: "BRONZE", minXp: 500, discount: 0, pointsMultiplier: 1 },
  { name: "SILVER", minXp: 1500, discount: 2, pointsMultiplier: 1.5 },
  { name: "GOLD", minXp: 4000, discount: 4, pointsMultiplier: 1.5 },
  { name: "PLATINUM", minXp: 8000, discount: 6, pointsMultiplier: 2 },
  { name: "DIAMOND", minXp: 18000, discount: 10, pointsMultiplier: 2 },
  { name: "MASTER", minXp: 35000, discount: 12, pointsMultiplier: 2 },
  { name: "LEGEND", minXp: 70000, discount: 15, pointsMultiplier: 2 },
];

export const LEVEL_COUPONS: Record<string, { discount: number; minSpent: number }> = {
  BRONZE: { discount: 5, minSpent: 35 },
  SILVER: { discount: 10, minSpent: 60 },
  GOLD: { discount: 20, minSpent: 90 },
  PLATINUM: { discount: 35, minSpent: 130 },
  DIAMOND: { discount: 60, minSpent: 180 },
  MASTER: { discount: 100, minSpent: 250 },
  LEGEND: { discount: 200, minSpent: 350 },
};

export function getLevel(xp: number) {
  return [...LEVELS].reverse().find((l) => xp >= l.minXp) || LEVELS[0];
}

export function getNextLevel(xp: number) {
  const current = getLevel(xp);
  const next = LEVELS.find((l) => l.minXp > xp);
  return next || null;
}

export function getXpProgress(xp: number) {
  const current = getLevel(xp);
  const next = getNextLevel(xp);
  if (!next) return 100;
  const currentMin = current.minXp;
  const nextMin = next.minXp;
  return ((xp - currentMin) / (nextMin - currentMin)) * 100;
}

export function calculateXp(total: number): number {
  let xp = total * 5;
  if (total > 500) xp += 1000;
  else if (total > 200) xp += 400;
  else if (total > 100) xp += 150;
  else if (total > 50) xp += 50;
  return Math.round(xp);
}