import { defineStore } from 'pinia';

export const useVocabStore = defineStore('vocab', {
  state: () => ({
    vocabData: {}, // area -> words
    currentArea: 1,
  }),
  actions: {
    async loadVocab(area) {
      if (this.vocabData[area]) return;
      try {
        const response = await fetch(`./vocab/area${area}.json`);
        const data = await response.json();
        this.vocabData[area] = data.words;
      } catch (error) {
        console.error(`Failed to load vocab for area ${area}:`, error);
      }
    },
    getRandomWord(area, difficulty) {
      const words = this.vocabData[area] || [];
      const filtered = words.filter(w => w.difficulty === difficulty);
      const pool = filtered.length > 0 ? filtered : words;
      if (pool.length === 0) return { word: 'test', difficulty: 1 };
      return pool[Math.floor(Math.random() * pool.length)];
    }
  }
});
