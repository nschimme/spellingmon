/**
 * Normalizes a string for spelling comparison.
 * Strips diacritics, hyphens, spaces and converts to lowercase.
 */
export const normalizeWord = (str: string | null | undefined) => {
  return (str || '').toLowerCase().trim()
    .normalize('NFD')
    .replace(/ß/g, 'ss')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-\s]/g, '');
};

/**
 * Checks if a word has capitalization or diacritics (a "challenge").
 */
export const hasSpellingChallenge = (word: string) => {
  const hasUpper = /[A-Z]/.test(word);
  const hasDiacritics = word.normalize('NFD') !== word.normalize('NFC') || /[ß]/.test(word);
  return hasUpper || hasDiacritics;
};

/**
 * Validates a spelling attempt.
 * Returns { isCorrect, isPerfect }.
 */
export const validateSpelling = (input: string, target: string) => {
  const normalizedInput = normalizeWord(input);
  const normalizedTarget = normalizeWord(target);
  const isCorrect = normalizedInput === normalizedTarget;

  const isChallenge = hasSpellingChallenge(target);
  const isPerfect = isCorrect && (input.trim() === target.trim()) && isChallenge;

  // If the word has no challenge, correct is treated as mastered
  const finalIsPerfect = isPerfect || (isCorrect && !isChallenge);

  return { isCorrect, isPerfect: finalIsPerfect };
};
