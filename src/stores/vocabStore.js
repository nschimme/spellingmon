import { defineStore } from 'pinia';

export const useVocabStore = defineStore('vocab', {
  state: () => ({
    vocabData: {}, // area -> words
  }),
  actions: {
    async loadVocab(area) {
      if (this.vocabData[area]) return;
      try {
        const baseUrl = import.meta.env.BASE_URL || '/';
        const url = `${baseUrl.endsWith('/') ? baseUrl : baseUrl + '/'}vocab/area${area}.json`;
        const response = await fetch(url);
        const data = await response.json();
        this.vocabData[area] = data.words;
      } catch (error) {
        console.error(`Failed to load vocab for area ${area}:`, error);
      }
    },
    getRandomWord(area, difficulty) {
      const words = this.vocabData[area] || [];
      if (words.length === 0) {
        console.error(`No vocabulary data loaded for area ${area}.`);
        return null;
      }

      const filtered = words.filter(w => w.difficulty === difficulty);
      const pool = filtered.length > 0 ? filtered : words;

      if (pool.length === 0) {
        console.error(`No words found for area ${area} even after fallback.`);
        return null;
      }

      return pool[Math.floor(Math.random() * pool.length)];
    }
  }
});
