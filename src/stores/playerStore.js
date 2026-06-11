import { defineStore } from 'pinia';
import { storage } from '../utils/storage';

export const usePlayerStore = defineStore('player', {
  state: () => {
    const saved = storage.load('player_state');
    return saved || {
      party: [],
      position: { x: 5, y: 5 },
      unlockedAreas: [1],
      currentArea: 1,
      lastSpellCenter: { x: 5, y: 5, area: 1 },
      isStarterSelected: false,
      defeatedTrainers: [],
      notification: null,
    };
  },
  actions: {
    notify(message) {
      this.notification = message;
      setTimeout(() => {
        if (this.notification === message) this.notification = null;
      }, 3000);
    },
    handleWhiteout() {
      this.setCurrentArea(this.lastSpellCenter.area);
      this.updatePosition({ x: this.lastSpellCenter.x, y: this.lastSpellCenter.y });
      this.healParty();
    },
    saveState() {
      storage.save('player_state', this.$state);
    },
    addSpellingmon(mon) {
      if (this.party.length < 6) {
        this.party.push(mon);
        this.saveState();
      }
    },
    updatePosition(pos) {
      this.position = pos;
      this.saveState();
    },
    setStarter(mon) {
      this.party = [mon];
      this.isStarterSelected = true;
      this.saveState();
    },
    healParty() {
      this.party.forEach(mon => {
        mon.hp = mon.maxHp;
      });
      this.saveState();
    },
    setCurrentArea(area) {
      this.currentArea = area;
      this.saveState();
    },
    unlockArea(area) {
      if (!this.unlockedAreas.includes(area)) {
        this.unlockedAreas.push(area);
        this.saveState();
      }
    },
    markTrainerDefeated(trainerId) {
      if (!this.defeatedTrainers.includes(trainerId)) {
        this.defeatedTrainers.push(trainerId);
        this.saveState();
      }
    }
  }
});
