import { defineStore } from 'pinia';
import { storage } from '../utils/storage';
import { GAME_CONSTANTS, GENDERS, SKIN_TONES, STORAGE_KEYS } from '../utils/constants';
import { calculateExpToNext, calculateStat, MONS, createMon, SPECIES } from '../utils/gameData';
import { useBattleStore } from './battleStore';
import { useSettingsStore } from './settingsStore';
import i18n from '../i18n';

let saveTimeout = null;
let notificationCounter = 0;

export const usePlayerStore = defineStore('player', {
  state: () => {
    const activeSlot = storage.load(STORAGE_KEYS.ACTIVE_SLOT);
    const saved = activeSlot !== null ? storage.load(STORAGE_KEYS.PLAYER_STATE, activeSlot) : null;
    const defaultState = {
      activeSlot,
      party: [],
      position: null,
      unlockedAreas: [1],
      currentArea: 1,
      lastSpellCenter: null,
      isStarterSelected: false,
      gameStarted: false,
      defeatedTrainers: [],
      notification: null,
      notificationId: null,
      evolutionPending: null, // { oldMon, newSpecies }
      // Character data
      playerName: 'Player',
      gender: GENDERS.BOY,
      skinTone: SKIN_TONES.NEUTRAL,
      mapSeed: Math.random().toString(36).slice(2, 11),
      characterCreationComplete: false,
      discoveredTiles: {}, // areaNum -> Set of "x,y" strings
      discoveredWords: {}, // areaNum -> Array of words (seen)
      masteredWords: {}, // areaNum -> Array of words (spelled correctly)
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

      mergedState.gameStarted = false; // Always start at LandingScreen on refresh
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
      // If we white out, we must go back to the last visited Spellcenter
      // Even if it was in a previous area.
      if (this.lastSpellCenter) {
        this.currentArea = this.lastSpellCenter.area;
        this.position = { x: this.lastSpellCenter.x, y: this.lastSpellCenter.y };
      }
      this.healParty();
      this.saveState();
    },
    saveState() {
      if (this.activeSlot === null) return;
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        // Create a clean state object for persistence
        const cleanState = { ...this.$state };
        delete cleanState.notification;
        delete cleanState.notificationId;
        delete cleanState.ttsVerified; // Migration: remove from per-slot save
        storage.save(STORAGE_KEYS.PLAYER_STATE, cleanState, this.activeSlot);
        storage.save(STORAGE_KEYS.ACTIVE_SLOT, this.activeSlot);
      }, GAME_CONSTANTS.SAVE_DEBOUNCE_MS);
    },
    loadSlot(slotIndex) {
      this.activeSlot = slotIndex;
      const saved = storage.load(STORAGE_KEYS.PLAYER_STATE, slotIndex);
      if (saved) {
        Object.assign(this.$state, saved);
        this.activeSlot = slotIndex; // Ensure it stays
      } else {
        this.resetToDefaults();
        this.activeSlot = slotIndex;
      }
      this.saveState();
    },
    deleteSlot(slotIndex) {
      storage.remove(`${STORAGE_KEYS.PLAYER_STATE}_slot_${slotIndex}`);
      if (this.activeSlot === slotIndex) {
        this.activeSlot = null;
        storage.remove(STORAGE_KEYS.ACTIVE_SLOT);
      }
    },
    resetToDefaults() {
      const defaults = {
        party: [],
        position: null,
        unlockedAreas: [1],
        currentArea: 1,
        lastSpellCenter: null,
        isStarterSelected: false,
        gameStarted: false,
        defeatedTrainers: [],
        evolutionPending: null,
        playerName: 'Player',
        gender: GENDERS.BOY,
        skinTone: SKIN_TONES.NEUTRAL,
        mapSeed: Math.random().toString(36).slice(2, 11),
        characterCreationComplete: false,
        discoveredTiles: {},
        discoveredWords: {},
        masteredWords: {},
      };
      Object.assign(this.$state, defaults);
    },
    discoverTile(area, x, y) {
      if (!this.discoveredTiles[area]) {
        this.discoveredTiles[area] = [];
      }
      const key = `${x},${y}`;
      if (!this.discoveredTiles[area].includes(key)) {
        this.discoveredTiles[area].push(key);
        this.saveState();
      }
    },
    recordDiscoveredWord(area, word) {
      if (!this.discoveredWords[area]) {
        this.discoveredWords[area] = [];
      }
      const normalizedWord = word.toLowerCase().trim();
      if (!this.discoveredWords[area].includes(normalizedWord)) {
        this.discoveredWords[area].push(normalizedWord);
        this.saveState();
        return true;
      }
      return false;
    },
    recordMasteredWord(area, word) {
      if (!this.masteredWords[area]) {
        this.masteredWords[area] = [];
      }
      const normalizedWord = word.toLowerCase().trim();
      if (!this.masteredWords[area].includes(normalizedWord)) {
        this.masteredWords[area].push(normalizedWord);
        // Also ensure it is in discovered
        this.recordDiscoveredWord(area, word);
        this.saveState();
        return true; // Newly mastered
      }
      return false;
    },
    addSpellingmon(mon) {
      if (this.party.length < 6) {
        this.party.push(mon);
        this.saveState();
        return true;
      }
      return false;
    },
    replaceSpellingmon(index, newMon) {
      if (index >= 0 && index < this.party.length) {
        this.party[index] = newMon;
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
    setPlayerData(data) {
      this.playerName = data.name || this.playerName;
      this.gender = data.gender || this.gender;
      this.skinTone = data.skinTone || this.skinTone;
      this.mapSeed = Math.random().toString(36).slice(2, 11); // New game, new seed
      this.characterCreationComplete = true;
      this.saveState();
    },
    resetStore() {
      if (saveTimeout) {
        clearTimeout(saveTimeout);
        saveTimeout = null;
      }

      const battleStore = useBattleStore();
      battleStore.resetStore();

      if (this.activeSlot !== null) {
        storage.remove(`${STORAGE_KEYS.PLAYER_STATE}_slot_${this.activeSlot}`);
      }
      this.resetToDefaults();
    },
    startGame() {
      this.gameStarted = true;
      this.saveState();
    },
    logout() {
      this.gameStarted = false;
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
    debugInit(params) {
      const settingsStore = useSettingsStore();
      if (params.name) this.playerName = params.name;
      if (params.locale) {
        settingsStore.setLocale(params.locale);
      }
      this.gameStarted = true;
      settingsStore.confirmTtsVerified();
      this.characterCreationComplete = true;

      if (params.starter) {
        const speciesName = Object.values(SPECIES).find(s => s.toLowerCase() === params.starter.toLowerCase()) || SPECIES.Grammander;
        const mon = createMon(speciesName, 5);
        this.party = [mon];
        this.isStarterSelected = true;
      }

      if (params.battle === 'true') {
        if (this.party.length === 0) {
          this.party = [createMon(SPECIES.Grammander, 5)];
          this.isStarterSelected = true;
        }
        const battleStore = useBattleStore();
        const enemy = createMon(SPECIES.Verminverb, 5);
        battleStore.startBattle(this.party[0], enemy);

        if (params.word) {
          battleStore.setCurrentWord({
            word: params.word,
            definition: 'Debug word',
            sentence_context: `This is a ${params.word}.`,
            difficulty: 1
          });
          battleStore.setPhase('spelling');
        }
      }

      this.saveState();
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
      if (healthyMons.length === 0) return [];

      const splitAmount = Math.floor(totalAmount / healthyMons.length);
      let remainder = totalAmount % healthyMons.length;

      const result = healthyMons.map((mon, i) => {
        const oldLevel = mon.level;
        const oldExp = mon.exp;
        let amount = splitAmount;
        if (i < remainder) amount += 1;

        if (amount > 0) {
          mon.exp += amount;
          while (mon.exp >= mon.expToNext) {
            this.levelUp(mon);
          }
        }
        return {
          id: mon.id,
          species: mon.species,
          emoji: mon.emoji,
          oldLevel,
          oldExp,
          oldLevelExpToNext: calculateExpToNext(oldLevel),
          level: mon.level,
          exp: mon.exp,
          expToNext: mon.expToNext,
          expGained: amount
        };
      });
      this.saveState();
      return result;
    },
    levelUp(mon) {
      mon.level++;
      mon.exp -= mon.expToNext;
      mon.expToNext = calculateExpToNext(mon.level);

      const base = MONS[mon.species];
      if (base) {
        mon.maxHp = calculateStat(base.baseHp, mon.level, true);
        mon.hp = mon.maxHp; // Fully heal on level up
        mon.atk = calculateStat(base.baseAtk, mon.level);
        mon.def = calculateStat(base.baseDef, mon.level);
        mon.spd = calculateStat(base.baseSpd, mon.level);
      }

      const { t } = i18n.global;
      this.notify(t('battle.levelUp', { name: t('monsters.' + mon.species), level: mon.level }));

      if (base && base.evolvesAt && mon.level >= base.evolvesAt) {
        this.evolutionPending = {
          monId: mon.id,
          oldSpecies: mon.species,
          newSpecies: base.evolvesInto
        };
      }
    },
    completeEvolution() {
      if (!this.evolutionPending) return;
      const index = this.party.findIndex(m => m.id === this.evolutionPending.monId);
      if (index !== -1) {
        const oldMon = this.party[index];
        const newSpecies = this.evolutionPending.newSpecies;
        const newMon = createMon(newSpecies, oldMon.level);
        newMon.id = oldMon.id; // Preserve ID
        newMon.exp = oldMon.exp; // Preserve EXP
        this.party[index] = newMon;
      }
      this.evolutionPending = null;
      this.saveState();
    }
  }
});
