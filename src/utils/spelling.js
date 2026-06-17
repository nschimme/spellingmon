/**
 * Normalizes a string for spelling comparison.
 * Strips diacritics, hyphens, spaces and converts to lowercase.
 */
export const normalizeWord = (str) => {
  return (str || '').toLowerCase().trim()
    .normalize('NFD')
    .replace(/ß/g, 'ss')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-\s]/g, '');
};

/**
 * Checks if a word has capitalization or diacritics (a "challenge").
 */
export const hasSpellingChallenge = (word) => {
  const hasUpper = /[A-Z]/.test(word);
  const hasDiacritics = word.normalize('NFD') !== word.normalize('NFC') || /[ß]/.test(word);
  return hasUpper || hasDiacritics;
};

/**
 * Validates a spelling attempt.
 * Returns { isCorrect, isPerfect }.
 */
export const validateSpelling = (input, target) => {
  const normalizedInput = normalizeWord(input);
  const normalizedTarget = normalizeWord(target);
  const isCorrect = normalizedInput === normalizedTarget;

  const isPerfect = isCorrect &&
                    (input.trim() === target.trim()) &&
                    hasSpellingChallenge(target);

  return { isCorrect, isPerfect };
};
