import { defineStore } from 'pinia';
import { storage } from '../utils/storage';
import { GAME_CONSTANTS, GENDERS, SKIN_TONES, STORAGE_KEYS } from '../utils/constants';
import { calculateExpToNext, calculateStat, MONS } from '../utils/gameData';
import { useBattleStore } from './battleStore';

let saveTimeout = null;
let notificationCounter = 0;

export const usePlayerStore = defineStore('player', {
  state: () => {
    const saved = storage.load(STORAGE_KEYS.PLAYER_STATE);
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
      evolutionPending: null, // { oldMon, newSpecies }
      // Character data
      playerName: 'Player',
      gender: GENDERS.BOY,
      skinTone: SKIN_TONES.NEUTRAL,
      mapSeed: Math.random().toString(36).slice(2, 11),
      characterCreationComplete: false,
      discoveredTiles: {}, // areaNum -> Set of "x,y" strings
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
      // If we white out, we must go back to the last visited Spellcenter
      // Even if it was in a previous area.
      this.currentArea = this.lastSpellCenter.area;
      this.position = { x: this.lastSpellCenter.x, y: this.lastSpellCenter.y };
      this.healParty();
      this.saveState();

      // Force map regeneration by triggering seed change or just relying on currentArea watch
      // Actually, if area is the same, watch won't trigger.
      // We might need a way to force WorldMap to re-sync.
      // For now, setting gameStarted to false then true quickly might work,
      // but let's just make sure WorldMap handles it.
    },
    saveState() {
      if (saveTimeout) clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        // Create a clean state object for persistence
        const cleanState = { ...this.$state };
        delete cleanState.notification;
        delete cleanState.notificationId;
        delete cleanState.ttsVerified;
        storage.save(STORAGE_KEYS.PLAYER_STATE, cleanState);
      }, GAME_CONSTANTS.SAVE_DEBOUNCE_MS);
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

      storage.remove(STORAGE_KEYS.PLAYER_STATE);
      // Reset state to defaults (excluding ttsVerified which is transient anyway)
      const defaults = {
        party: [],
        position: { x: 5, y: 5 },
        unlockedAreas: [1],
        currentArea: 1,
        lastSpellCenter: { x: 5, y: 5, area: 1 },
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
      };
      Object.assign(this.$state, defaults);
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
      let remainder = totalAmount % healthyMons.length;

      healthyMons.forEach((mon, i) => {
        let amount = splitAmount;
        if (i < remainder) amount += 1;

        if (amount > 0) {
          mon.exp += amount;
          while (mon.exp >= mon.expToNext) {
            this.levelUp(mon);
          }
        }
      });
      this.saveState();
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

      this.notify(`${mon.name} grew to Level ${mon.level}!`);

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
      const mon = this.party.find(m => m.id === this.evolutionPending.monId);
      if (mon) {
        const newSpecies = this.evolutionPending.newSpecies;
        const base = MONS[newSpecies];
        mon.species = newSpecies;
        mon.name = base.name;
        mon.type = base.type;
        // Recalculate stats for new species
        mon.maxHp = calculateStat(base.baseHp, mon.level, true);
        mon.hp = mon.maxHp;
        mon.atk = calculateStat(base.baseAtk, mon.level);
        mon.def = calculateStat(base.baseDef, mon.level);
        mon.spd = calculateStat(base.baseSpd, mon.level);
      }
      this.evolutionPending = null;
      this.saveState();
    }
  }
});
