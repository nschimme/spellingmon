import { defineStore } from 'pinia';
import { storage } from '../utils/storage';
import { GAME_CONSTANTS } from '../utils/constants';

let saveTimeout = null;

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
    const saved = storage.load('battle_state') || {};
    return { ...defaults, ...saved };
  },
  actions: {
    saveState() {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        storage.save('battle_state', this.$state);
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
      this.isPlayerTurn = true;
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
    setCurrentWord(word) {
      this.currentWord = word;
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
