import { defineStore } from 'pinia';
import { storage } from '../utils/storage';
import { STORAGE_KEYS } from '../utils/constants';
import { calculateExpToNext, calculateStat, MONS, createMon, type Monster, type Word } from '../utils/gameData';

export interface PlayerState {
  name: string;
  gender: string;
  skinTone: string;
  party: Monster[];
  position: { x: number; y: number } | null;
  currentArea: number;
  unlockedAreas: number[];
  lastSpellCenter: { x: number; y: number } | null;
  defeatedTrainers: string[];
  mapSeed: string | null;
  characterCreationComplete: boolean;
  isStarterSelected: boolean;
}

export interface BattleState {
  active: boolean;
  type: string;
  enemyMon: Monster | null;
  playerMonId: string | null;
  log: string[];
  isPlayerTurn: boolean;
  trainerId: string | null;
  trainerParty: Monster[];
  participatingMonIds: string[];
  currentWord: Word | null;
  totalTime: number;
  isCapturing: boolean;
  results?: Monster[];
  startTime?: number;
  debugWord?: string | null;
}

export interface DexState {
  discoveredTiles: Record<number, string[]>;
  discoveredWords: Record<number, string[]>;
  masteredWords: Record<number, string[]>;
}

export interface SessionStoreState {
  activeSlot: number | null;
  player: PlayerState;
  battle: BattleState;
  dex: DexState;
  notification: string | null;
  evolutionPending: { monId: string; newSpecies: string; oldSpecies?: string } | null;
  _saveTimeout?: ReturnType<typeof setTimeout>;
}

export const SESSION_PERSIST_VERSION = '1.0.0';

/**
 * Migration helper for session data.
 * Used by persistence plugin and UI for slot previews.
 */
export function migrateSessionData(data: any, version: string) {
  // Add migration logic here when version increases
  if (version) { /* no-op */ }
  return data;
}

/**
 * Normalizes a session snapshot for UI preview or initial load.
 */
export function getSessionSnapshot(saved: any) {
  if (!saved || typeof saved !== 'object') return null;
  const { version, data } = saved;
  if (version === undefined || data === undefined) return null;

  const processedData = version === SESSION_PERSIST_VERSION
    ? data
    : migrateSessionData(data, version);

  // Validate that the snapshot contains minimal required player state
  if (!processedData || !processedData.player) {
    return null;
  }

  return processedData;
}

/**
 * Unified Session Store
 * Handles ALL persistent game data for the current active slot.
 */
export const useSessionStore = defineStore('session', {
  persist: {
    key: STORAGE_KEYS.SESSION,
    version: SESSION_PERSIST_VERSION,
    slotDependent: true,
    migrate: migrateSessionData,
    exclude: ['battle', 'activeSlot', 'notification', 'evolutionPending', '_saveTimeout']
  },
  state: (): SessionStoreState => ({
    activeSlot: null,

    player: {
      name: 'Player',
      gender: 'Boy',
      skinTone: 'neutral',
      party: [],
      position: null,
      currentArea: 1,
      unlockedAreas: [1],
      lastSpellCenter: null,
      defeatedTrainers: [],
      mapSeed: null,
      characterCreationComplete: false,
      isStarterSelected: false,
    },

    battle: {
      active: false,
      type: 'wild',
      enemyMon: null,
      playerMonId: null,
      log: [],
      isPlayerTurn: true,
      trainerId: null,
      trainerParty: [],
      participatingMonIds: [],
      currentWord: null,
      totalTime: 0,
      isCapturing: false,
    },

    dex: {
      discoveredTiles: {},
      discoveredWords: {},
      masteredWords: {},
    },

    notification: null,
    evolutionPending: null,
  }),

  getters: {
    activePlayerMon: (state): Monster | null => {
      if (!state.battle.playerMonId) return null;
      return state.player.party.find(m => m.id === state.battle.playerMonId) || null;
    }
  },

  actions: {
    setSlot(slotIndex: any) {
      const idx = typeof slotIndex === 'number' ? slotIndex : parseInt(slotIndex);
      if (isNaN(idx)) {
        console.error('Invalid slot index:', slotIndex);
        return;
      }

      // 1. Reset transient state first to avoid it being saved into the NEW slot key
      // if the debounce timer triggers immediately after activeSlot change.
      this.resetBattle();

      // 2. Setting activeSlot will trigger the persistencePlugin to update its cache
      // and trigger an automatic loadAndPatch for this store.
      this.activeSlot = idx;

      // Note: persistencePlugin handles loading the data from the new slot via loadAndPatch()
      // when it detects the activeSlot change in its $subscribe handler.
    },

    save() {
      // Logic handled by persistence plugin, but keeping as no-op for compatibility
    },

    resetBattle() {
      this.battle = {
        active: false,
        type: 'wild',
        enemyMon: null,
        playerMonId: null,
        log: [],
        isPlayerTurn: true,
        trainerId: null,
        trainerParty: [],
        participatingMonIds: [],
        currentWord: null,
        totalTime: 0,
        isCapturing: false,
      };
    },

    resetSession() {
      this.player = {
        name: 'Player',
        gender: 'Boy',
        skinTone: 'neutral',
        party: [],
        position: null,
        currentArea: 1,
        unlockedAreas: [1],
        lastSpellCenter: null,
        defeatedTrainers: [],
        mapSeed: Math.random().toString(36).slice(2, 11),
        characterCreationComplete: false,
        isStarterSelected: false,
      };
      this.resetBattle();
      this.dex = {
        discoveredTiles: {},
        discoveredWords: {},
        masteredWords: {},
      };
    },

    updatePlayerPosition(pos: { x: number; y: number } | null) {
      this.player.position = pos;
    },

    healParty() {
      this.player.party.forEach(mon => { mon.hp = mon.maxHp; });
    },

    addMonToParty(mon: Monster) {
      if (this.player.party.length < 6) {
        this.player.party.push(mon);
        return true;
      }
      return false;
    },

    damageEnemy(amount: number) {
      if (this.battle.enemyMon) {
        this.battle.enemyMon.hp = Math.max(0, this.battle.enemyMon.hp - amount);
      }
    },

    damagePlayerMon(amount: number) {
      const mon = this.activePlayerMon;
      if (mon) {
        mon.hp = Math.max(0, mon.hp - amount);
      }
    },

    awardExp(totalAmount: number) {
      const healthyMons = this.player.party.filter(m => m.hp > 0 && this.battle.participatingMonIds.includes(m.id));
      if (healthyMons.length === 0) return [];

      const splitAmount = Math.floor(totalAmount / healthyMons.length);
      const results = healthyMons.map(mon => {
        const oldLevel = mon.level;
        const oldExp = mon.exp;
        const oldLevelExpToNext = mon.expToNext;

        mon.exp += splitAmount;
        while (mon.exp >= mon.expToNext) {
          this.levelUpMon(mon);
        }
        return {
          ...JSON.parse(JSON.stringify(mon)),
          oldLevel,
          oldExp,
          oldLevelExpToNext,
          expGained: splitAmount
        };
      });
      return results;
    },

    levelUpMon(mon: Monster) {
      mon.level++;
      mon.exp -= mon.expToNext;
      mon.expToNext = calculateExpToNext(mon.level);
      const base = MONS[mon.species];
      if (base) {
        mon.maxHp = calculateStat(base.baseHp, mon.level, true);
        mon.hp = mon.maxHp;
        mon.atk = calculateStat(base.baseAtk, mon.level);
        mon.def = calculateStat(base.baseDef, mon.level);
        mon.spd = calculateStat(base.baseSpd, mon.level);
        if (base.evolvesAt && mon.level >= base.evolvesAt) {
          this.evolutionPending = { monId: mon.id, newSpecies: base.evolvesInto || '', oldSpecies: mon.species };
        }
      }
    },

    completeEvolution() {
      if (!this.evolutionPending) return;
      const index = this.player.party.findIndex(m => m.id === this.evolutionPending!.monId);
      if (index !== -1) {
        const oldMon = this.player.party[index];
        const newSpecies = this.evolutionPending!.newSpecies;
        const newMon = createMon(newSpecies, oldMon.level);
        newMon.id = oldMon.id;
        newMon.exp = oldMon.exp;
        this.player.party[index] = newMon;
      }
      this.evolutionPending = null;
    },

    recordDiscovery(type: keyof DexState, area: number, value: string) {
      if (!this.dex[type][area]) this.dex[type][area] = [];
      if (!this.dex[type][area].includes(value)) {
        this.dex[type][area].push(value);
      }
    },

    discoverTile(area: number, x: number, y: number) {
      this.recordDiscovery('discoveredTiles', area, `${x},${y}`);
    },

    notify(message: string) {
      this.notification = message;
      setTimeout(() => { if (this.notification === message) this.notification = null; }, 3000);
    },

    setPlayerData(data: { name?: string; gender?: string; skinTone?: string }) {
      this.player.name = data.name || this.player.name;
      this.player.gender = data.gender || this.player.gender;
      this.player.skinTone = data.skinTone || this.player.skinTone;
      this.player.mapSeed = Math.random().toString(36).slice(2, 11);
      this.player.characterCreationComplete = true;
    },

    setStarter(mon: Monster) {
      this.player.party = [mon];
      this.player.isStarterSelected = true;
    },

    loadSlot(index: number) {
      this.setSlot(index);
    },

    deleteSlot(index: number) {
      storage.remove(STORAGE_KEYS.SESSION, index);
      if (this.activeSlot === index) {
        this.activeSlot = null;
      }
    },

    logout() {
      // Handled by FSM transition now
    },

    moveMonToFront(index: number) {
      if (index > 0 && index < this.player.party.length) {
        const mon = this.player.party.splice(index, 1)[0];
        this.player.party.unshift(mon);
      }
    }
  }
});
