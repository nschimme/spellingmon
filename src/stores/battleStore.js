import { defineStore } from 'pinia';
import { storage } from '../utils/storage';
import { GAME_CONSTANTS, BATTLE_TYPES, STORAGE_KEYS, BATTLE_PHASES } from '../utils/constants';
import { usePlayerStore } from './playerStore';
import { calculateDamage } from '../utils/gameData';

export const useBattleStore = defineStore('battle', {
  state: () => {
    const defaults = {
      inBattle: false,
      phase: BATTLE_PHASES.START,
      playerMon: null,
      enemyMon: null,
      battleLog: [],
      isPlayerTurn: true,
      currentWord: null,
      battleType: BATTLE_TYPES.WILD,
      trainerId: null,
      trainerParty: [],
      isSwitching: false,
      isCapturing: false,
      pendingCapture: null,
    };

    const rawSaved = typeof window !== 'undefined' ? storage.load(STORAGE_KEYS.BATTLE_STATE) : null;
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

    if (saved.phase && Object.values(BATTLE_PHASES).includes(saved.phase)) {
      validated.phase = saved.phase;
    }

    // Current word should be an object, string, or null/undefined
    if (typeof saved.currentWord === 'object' || typeof saved.currentWord === 'string' || saved.currentWord === null) {
      validated.currentWord = saved.currentWord;
    }

    // Battle type must be one of the known values
    if (Object.values(BATTLE_TYPES).includes(saved.battleType)) {
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

    // Trainer party rehydration
    if (Array.isArray(saved.trainerParty)) {
      validated.trainerParty = saved.trainerParty;
    }

    if (typeof saved.isSwitching === 'boolean') {
      validated.isSwitching = saved.isSwitching;
    }

    if (typeof saved.isCapturing === 'boolean') {
      validated.isCapturing = saved.isCapturing;
    }

    if (saved.pendingCapture) {
      validated.pendingCapture = saved.pendingCapture;
    }

    return validated;
  },
  actions: {
    saveState() {
      if (this._saveTimeout) clearTimeout(this._saveTimeout);
      this._saveTimeout = setTimeout(() => {
        const { inBattle, phase, playerMon, enemyMon, battleLog, isPlayerTurn, currentWord, battleType, trainerId, trainerParty, isSwitching, isCapturing, pendingCapture } = this.$state;
        storage.save(STORAGE_KEYS.BATTLE_STATE, { inBattle, phase, playerMon, enemyMon, battleLog, isPlayerTurn, currentWord, battleType, trainerId, trainerParty, isSwitching, isCapturing, pendingCapture });
      }, GAME_CONSTANTS.SAVE_DEBOUNCE_MS);
    },
    startBattle(playerMon, enemyMon, type = BATTLE_TYPES.WILD, trainer = null, trainerId = null, trainerParty = []) {
      this.playerMon = playerMon;
      this.enemyMon = enemyMon;
      this.inBattle = true;
      this.phase = BATTLE_PHASES.START;
      this.battleType = type;
      this.trainerId = trainerId;
      this.trainerParty = trainerParty;

      if (type === BATTLE_TYPES.TRAINER) {
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
    // New action to centralize damage processing
    processAttack(isPower, isPerfect = false) {
      // Tiers of Power:
      // 30 (Correct), 45 (Correct+Fast), 60 (Perfect), 75 (Perfect+Fast)
      let basePower = 30;
      if (isPerfect && isPower) basePower = 75;
      else if (isPerfect) basePower = 60;
      else if (isPower) basePower = 45;

      const wordDifficulty = this.currentWord?.difficulty || 1;
      const { damage, typeMod } = calculateDamage(this.playerMon, this.enemyMon, basePower, wordDifficulty);

      if (isPerfect && isPower) {
        this.log("Perfect & Fast! Ultimate Hit!");
      } else if (isPerfect) {
        this.log("Perfect! Great Hit!");
      } else if (isPower) {
        this.log("Correct & Fast! Good Hit!");
      } else {
        this.log("Correct! Dealt damage.");
      }

      this.damageEnemy(damage);
      this.log(`Dealt ${damage} damage.`);
      if (typeMod > 1) this.log("It's super effective!");
      if (typeMod < 1 && typeMod > 0) this.log("It's not very effective...");
      if (typeMod === 0) this.log("It had no effect!");

      return { damage, typeMod };
    },
    getNextTrainerMon() {
      if (this.battleType !== BATTLE_TYPES.TRAINER) return null;

      const currentMonInParty = this.trainerParty.find(m => !m.isDefeated);
      if (currentMonInParty) {
        currentMonInParty.isDefeated = true;
      }

      return this.trainerParty.find(m => !m.isDefeated) || null;
    },
    log(msg) {
      this.battleLog.push(msg);
      if (this.battleLog.length > 5) this.battleLog.shift();
      this.saveState();
    },
    endBattle() {
      this.inBattle = false;
      this.phase = BATTLE_PHASES.END;
      this.playerMon = null;
      this.enemyMon = null;
      this.currentWord = null;
      this.trainerId = null;
      this.battleType = BATTLE_TYPES.WILD;
      this.isSwitching = false;
      this.isCapturing = false;
      this.pendingCapture = null;
      this.saveState();
    },
    setPhase(phase) {
      if (Object.values(BATTLE_PHASES).includes(phase)) {
        this.phase = phase;
        this.saveState();
      }
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
      this.isSwitching = false;
      this.log(`Go, ${newMon.name}!`);
      this.setPhase(BATTLE_PHASES.SELECT_ACTION);
    },
    damageEnemy(amount) {
      if (!this.enemyMon) return;
      this.enemyMon.hp = Math.max(0, this.enemyMon.hp - amount);
      this.saveState();
    },
    damagePlayer(amount) {
      if (!this.playerMon) return;
      this.playerMon.hp = Math.max(0, this.playerMon.hp - amount);

      // Keep player store in sync
      const playerStore = usePlayerStore();
      const partyMon = playerStore.party.find(m => m.id === this.playerMon.id);
      if (partyMon) {
        partyMon.hp = this.playerMon.hp;
        playerStore.saveState();
      }

      this.saveState();
    },
    resetStore() {
      if (this._saveTimeout) clearTimeout(this._saveTimeout);
      storage.remove(STORAGE_KEYS.BATTLE_STATE);
      const defaults = {
        inBattle: false,
        phase: BATTLE_PHASES.START,
        playerMon: null,
        enemyMon: null,
        battleLog: [],
        isPlayerTurn: true,
        currentWord: null,
        battleType: BATTLE_TYPES.WILD,
        trainerId: null,
        trainerParty: [],
        isSwitching: false,
        isCapturing: false,
        pendingCapture: null,
      };
      Object.assign(this.$state, defaults);
    }
  }
});
