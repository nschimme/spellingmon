import { defineStore } from 'pinia';
import { storage } from '../utils/storage';
import { GAME_CONSTANTS } from '../utils/constants';

let saveTimeout = null;
let notificationCounter = 0;

export const usePlayerStore = defineStore('player', {
  state: () => {
    const saved = storage.load('player_state');
    const defaultState = {
      party: [],
      position: { x: 5, y: 5 },
      unlockedAreas: [1],
      currentArea: 1,
      lastSpellCenter: { x: 5, y: 5, area: 1 },
      isStarterSelected: false,
      gameStarted: false,
      ttsVerified: false,
      defeatedTrainers: [],
      notification: null,
      notificationId: null,
    };

    if (saved) {
      return {
        ...defaultState,
        ...saved,
        ttsVerified: false // Explicitly set to false every load
      };
    }
    return defaultState;
  },
  actions: {
    notify(message) {
      const id = ++notificationCounter;
      this.notification = message;
      this.notificationId = id;

      setTimeout(() => {
        if (this.notificationId === id) {
          this.notification = null;
          this.notificationId = null;
        }
      }, GAME_CONSTANTS.NOTIFICATION_DURATION_MS);
    },
    handleWhiteout() {
      this.setCurrentArea(this.lastSpellCenter.area);
      this.updatePosition({ x: this.lastSpellCenter.x, y: this.lastSpellCenter.y });
      this.healParty();
    },
    saveState() {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        // Create a clean state object for persistence
        const cleanState = { ...this.$state };
        delete cleanState.notification;
        delete cleanState.notificationId;
        delete cleanState.ttsVerified;
        storage.save('player_state', cleanState);
      }, GAME_CONSTANTS.SAVE_DEBOUNCE_MS);
    },
    addSpellingmon(mon) {
      if (this.party.length < 6) {
        this.party.push(mon);
        this.saveState();
        return true;
      }
      return false;
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
    startGame() {
      this.gameStarted = true;
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
    },
    confirmTtsVerified() {
      this.ttsVerified = true;
      // We don't saveState() here because ttsVerified is deliberately excluded from persistence
    }
  }
});
