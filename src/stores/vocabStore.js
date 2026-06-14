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
        this.vocabData[area] = Array.isArray(data) ? data : (Array.isArray(data.words) ? data.words : []);
      } catch (error) {
        console.error(`Failed to load vocab for area ${area}:`, error);
      }
    },
    getRandomWord(area) {
      const words = this.vocabData[area] || [];
      if (words.length === 0) {
        console.error(`No vocabulary data loaded for area ${area}.`);
        return null;
      }

      return words[Math.floor(Math.random() * words.length)];
    }
  }
});
