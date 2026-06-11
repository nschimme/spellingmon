import { defineStore } from 'pinia';

export const useBattleStore = defineStore('battle', {
  state: () => ({
    inBattle: false,
    playerMon: null,
    enemyMon: null,
    battleLog: [],
    isPlayerTurn: true,
    currentWord: null,
    battleType: 'wild', // 'wild' or 'trainer'
    trainerId: null,
  }),
  actions: {
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
    },
    log(msg) {
      this.battleLog.push(msg);
      if (this.battleLog.length > 5) this.battleLog.shift();
    },
    endBattle() {
      this.inBattle = false;
      this.playerMon = null;
      this.enemyMon = null;
      this.currentWord = null;
      this.trainerId = null;
      this.battleType = 'wild';
    }
  }
});
