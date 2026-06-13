import { defineStore } from 'pinia';
import { storage } from '../utils/storage';
import { GAME_CONSTANTS } from '../utils/constants';
import { calculateExpToNext } from '../utils/gameData';

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
      const mergedState = {
        ...defaultState,
        ...saved,
      };

      // Targeted deep merge for known nested structures to handle evolving state shapes
      if (saved.position) {
        mergedState.position = {
          ...defaultState.position,
          ...saved.position,
        };
      }

      if (saved.lastSpellCenter) {
        mergedState.lastSpellCenter = {
          ...defaultState.lastSpellCenter,
          ...saved.lastSpellCenter,
        };
      }

      // Ensure all party members have required stats for the new EXP system
      mergedState.party.forEach(mon => {
        if (mon.exp === undefined) mon.exp = 0;
        if (mon.expToNext === undefined) {
          mon.expToNext = calculateExpToNext(mon.level || 5);
        }
      });

      mergedState.ttsVerified = false; // Explicitly set to false every load
      return mergedState;
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
    },
    moveMonToFront(index) {
      if (index > 0 && index < this.party.length) {
        const mon = this.party.splice(index, 1)[0];
        this.party.unshift(mon);
        this.saveState();
      }
    },
    awardExp(totalAmount) {
      const healthyMons = this.party.filter(m => m.hp > 0);
      if (healthyMons.length === 0) return;

      const splitAmount = Math.floor(totalAmount / healthyMons.length);
      if (splitAmount <= 0) return;

      healthyMons.forEach(mon => {
        mon.exp += splitAmount;
        while (mon.exp >= mon.expToNext) {
          this.levelUp(mon);
        }
      });
      this.saveState();
    },
    levelUp(mon) {
      mon.level++;
      mon.exp -= mon.expToNext;
      mon.expToNext = calculateExpToNext(mon.level);

      const hpGain = 5 + Math.floor(Math.random() * 3);
      mon.maxHp += hpGain;
      mon.hp += hpGain;

      this.notify(`${mon.name} grew to Level ${mon.level}!`);
    }
  }
});
