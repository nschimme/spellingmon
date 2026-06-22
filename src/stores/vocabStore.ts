import { defineStore } from 'pinia';
import { type Word } from '../utils/gameData';

export interface VocabStoreState {
  vocabData: Record<string, Word[]>;
  vocabPool: Record<string, Word[]>;
  lastWord: Record<string, string>;
}

export const useVocabStore = defineStore('vocab', {
  state: (): VocabStoreState => ({
    vocabData: {}, // cacheKey -> words (raw)
    vocabPool: {}, // cacheKey -> shuffled pool
    lastWord: {},  // cacheKey -> word string
  }),
  actions: {
    async loadVocab(area: number, lang = 'en-US') {
      const cacheKey = `${lang}_${area}`;
      if (this.vocabData[cacheKey]) return;
      try {
        const baseUrl = import.meta.env.BASE_URL || '/';
        const url = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}vocab/${lang}/area${area}.json`;
        const response = await fetch(url);
        const data = await response.json();
        this.vocabData[cacheKey] = Array.isArray(data) ? data : (Array.isArray(data.words) ? data.words : []);
      } catch (error) {
        console.error(`Failed to load vocab for area ${area} in ${lang}:`, error);
      }
    },
    getRandomWord(area: number, lang = 'en-US'): Word | null {
      const cacheKey = `${lang}_${area}`;

      if (!this.vocabPool[cacheKey] || this.vocabPool[cacheKey].length === 0) {
        const words = this.vocabData[cacheKey] || [];
        if (words.length === 0) {
          console.error(`No vocabulary data loaded for area ${area}.`);
          return null;
        }

        const shuffled = [...words].sort(() => Math.random() - 0.5);

        // Avoid direct repeats when resorting
        if (shuffled.length > 1 && shuffled[0].word === this.lastWord[cacheKey]) {
          const first = shuffled.shift()!;
          shuffled.push(first);
        }

        this.vocabPool[cacheKey] = shuffled;
      }

      const word = this.vocabPool[cacheKey].shift()!;
      this.lastWord[cacheKey] = word.word;
      return word;
    }
  }
});
