/**
 * Standardizes HP bar color classes based on current HP ratio.
 * @param {number} hp - Current health points
 * @param {number} max - Maximum health points
 * @returns {string} Tailwind background color class
 */
export const getHPColorClass = (hp: number, max: number) => {
  const ratio = hp / max;
  if (ratio > 0.5) return 'bg-green-500';
  if (ratio > 0.2) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const TYPE_COLORS: Record<string, string> = {
  Normal: 'bg-gray-400',
  Fire: 'bg-red-500',
  Water: 'bg-blue-500',
  Grass: 'bg-green-500',
  Electric: 'bg-yellow-400',
  Ice: 'bg-cyan-300',
  Fighting: 'bg-orange-700',
  Poison: 'bg-purple-500',
  Ground: 'bg-yellow-700',
  Flying: 'bg-indigo-400',
  Psychic: 'bg-pink-500',
  Bug: 'bg-lime-500',
  Rock: 'bg-stone-600',
  Ghost: 'bg-violet-800',
  Dragon: 'bg-indigo-700',
};

export const STATUS_COLORS: Record<string, string> = {
  POISON: 'bg-purple-600',
  PARALYSIS: 'bg-yellow-400',
  SLEEP: 'bg-gray-500',
  BURN: 'bg-red-600',
  FREEZE: 'bg-cyan-400',
  CONFUSION: 'bg-pink-400',
};
