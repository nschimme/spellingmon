import { defineStore } from 'pinia';
import { storage } from '../utils/storage';
import { GAME_CONSTANTS } from '../utils/constants';

export const useBattleStore = defineStore('battle', {
  state: () => {
    const defaults = {
      inBattle: false,
      playerMon: null,
      enemyMon: null,
      battleLog: [],
      isPlayerTurn: true,
      currentWord: null,
      battleType: 'wild', // 'wild' or 'trainer'
      trainerId: null,
    };

    const rawSaved = typeof window !== 'undefined' ? storage.load('battle_state') : null;
    const saved = (rawSaved && typeof rawSaved === 'object') ? rawSaved : {};

    const validated = { ...defaults };

    // Validate battle-specific state first
    if (typeof saved.inBattle === 'boolean' && saved.inBattle) {
      const hasValidPlayer =
        saved.playerMon &&
        typeof saved.playerMon === 'object' &&
        typeof saved.playerMon.hp === 'number';

      const hasValidEnemy =
        saved.enemyMon &&
        typeof saved.enemyMon === 'object' &&
        typeof saved.enemyMon.hp === 'number';

      const isValid = hasValidPlayer && hasValidEnemy;

      if (!isValid) {
        console.warn('Invalid battle state detected, resetting to defaults.');
        return defaults;
      }

      validated.inBattle = true;
      validated.playerMon = saved.playerMon;
      validated.enemyMon = saved.enemyMon;
    } else if (typeof saved.inBattle === 'boolean') {
      // Accept a valid boolean even when not in battle
      validated.inBattle = saved.inBattle;
    }

    // Validate/normalize non-battle fields

    // Battle log must be an array
    if (Array.isArray(saved.battleLog)) {
      validated.battleLog = saved.battleLog;
    }

    // Turn flag must be boolean
    if (typeof saved.isPlayerTurn === 'boolean') {
      validated.isPlayerTurn = saved.isPlayerTurn;
    }

    // Current word should be an object, string, or null/undefined
    if (typeof saved.currentWord === 'object' || typeof saved.currentWord === 'string' || saved.currentWord === null) {
      validated.currentWord = saved.currentWord;
    }

    // Battle type must be one of the known values
    if (saved.battleType === 'wild' || saved.battleType === 'trainer') {
      validated.battleType = saved.battleType;
    }

    // Trainer ID: allow null/undefined or primitive identifier types
    if (
      saved.trainerId === null ||
      saved.trainerId === undefined ||
      ['string', 'number'].includes(typeof saved.trainerId)
    ) {
      validated.trainerId = saved.trainerId;
    }

    return validated;
  },
  actions: {
    saveState() {
      if (this._saveTimeout) clearTimeout(this._saveTimeout);
      this._saveTimeout = setTimeout(() => {
        const { inBattle, playerMon, enemyMon, battleLog, isPlayerTurn, currentWord, battleType, trainerId } = this.$state;
        storage.save('battle_state', { inBattle, playerMon, enemyMon, battleLog, isPlayerTurn, currentWord, battleType, trainerId });
      }, GAME_CONSTANTS.SAVE_DEBOUNCE_MS);
    },
    startBattle(playerMon, enemyMon, type = 'wild', trainer = null, trainerId = null) {
      this.playerMon = playerMon;
      this.enemyMon = enemyMon;
      this.inBattle = true;
      this.battleType = type;
      this.trainerId = trainerId;

      if (type === 'trainer') {
        this.battleLog = [`${trainer.name} wants to battle!`, `They sent out ${enemyMon.name}!`];
      } else {
        this.battleLog = [`A wild ${enemyMon.name} appeared!`];
      }

      // Determine initial turn based on Speed
      this.isPlayerTurn = (playerMon.spd >= enemyMon.spd);
      if (!this.isPlayerTurn) {
        this.log(`${enemyMon.name} is faster!`);
      }

      this.saveState();
    },
    log(msg) {
      this.battleLog.push(msg);
      if (this.battleLog.length > 5) this.battleLog.shift();
      this.saveState();
    },
    endBattle() {
      this.inBattle = false;
      this.playerMon = null;
      this.enemyMon = null;
      this.currentWord = null;
      this.trainerId = null;
      this.battleType = 'wild';
      this.saveState();
    },
    setTurn(isPlayerTurn) {
      this.isPlayerTurn = isPlayerTurn;
      this.saveState();
    },
    setCurrentWord(wordObj) {
      this.currentWord = wordObj;
      this.saveState();
    },
    switchPlayerMon(newMon) {
      this.playerMon = newMon;
      this.log(`Go, ${newMon.name}!`);
      this.saveState();
    },
    damageEnemy(amount) {
      if (!this.enemyMon) return;
      this.enemyMon.hp = Math.max(0, this.enemyMon.hp - amount);
      this.saveState();
    },
    damagePlayer(amount) {
      if (!this.playerMon) return;
      this.playerMon.hp = Math.max(0, this.playerMon.hp - amount);
      this.saveState();
    }
  }
});
