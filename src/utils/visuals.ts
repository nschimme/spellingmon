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
