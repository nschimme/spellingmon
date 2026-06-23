import { defineStore } from 'pinia';
import { storage } from '../utils/storage';
import { STORAGE_KEYS, GAME_CONSTANTS } from '../utils/constants';
import { calculateExpToNext, calculateStat, MONS, createMon, type Monster, type Word } from '../utils/gameData';
import i18n from '../i18n';

export interface PlayerState {
  name: string;
  gender: string;
  skinTone: string;
  party: Monster[];
  position: { x: number; y: number } | null;
  currentArea: number;
  currentInterior: string | null;
  currentFloor: string | null;
  badges: string[];
  unlockedAreas: number[];
  lastSpellCenter: { x: number; y: number; interior: string | null; floor: string | null } | null;
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
  trainerDefeatDialog: string | null;
  isStorm: boolean;
  participatingMonIds: string[];
  currentWord: Word | null;
  totalTime: number;
  isCapturing: boolean;
  results?: Monster[];
  startTime?: number;
  debugWord?: string | null;
}

export type WordStatus = 'seen' | 'correct' | 'mastered';

export interface DexState {
  discoveredTiles: Record<number, string[]>;
  words: Record<number, Record<string, WordStatus>>;
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
 * Ensures session data is consistent and valid.
 * Returns a sanitized clone of the data.
 */
export function sanitizeSessionData(data: Partial<SessionStoreState>): Partial<SessionStoreState> {
  if (!data || !data.player) return data;

  // Deep clone to avoid mutating the original object
  const cloned = JSON.parse(JSON.stringify(data)) as SessionStoreState;
  const player = cloned.player;

  const MAP_WIDTH = GAME_CONSTANTS.MAP_WIDTH;
  const MAP_HEIGHT = GAME_CONSTANTS.MAP_HEIGHT;
  const defaultCenter = {
    x: Math.floor(MAP_WIDTH / 2),
    y: Math.floor(MAP_HEIGHT / 2),
  };

  const isOutOfBounds = (point?: { x: number; y: number } | null) =>
    !point ||
    point.x < 0 ||
    point.x >= MAP_WIDTH ||
    point.y < 0 ||
    point.y >= MAP_HEIGHT;

  // Ensure position is valid or reset to lastSpellCenter/default
  if (isOutOfBounds(player.position)) {
    if (player.lastSpellCenter && !isOutOfBounds(player.lastSpellCenter)) {
      player.position = { ...player.lastSpellCenter };
    } else {
      player.position = defaultCenter;
    }
  }

  // Ensure character creation and starter selection are consistent
  if (player.party && player.party.length > 0) {
    player.isStarterSelected = true;
    player.characterCreationComplete = true;
  }

  return cloned;
}

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

  let processedData = version === SESSION_PERSIST_VERSION
    ? data
    : migrateSessionData(data, version);

  // Validate that the snapshot contains minimal required player state
  if (!processedData || !processedData.player) {
    return null;
  }

  // Always sanitize snapshots to ensure UI previews and loaded data are consistent
  processedData = sanitizeSessionData(processedData);

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
    sanitize: sanitizeSessionData,
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
      currentInterior: 'home_2f',
      currentFloor: null,
      badges: [],
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
      words: {},
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
    t(key: string, params?: any) {
      return i18n.global.t(key, params);
    },
    setSlot(slotIndex: any) {
      const idx = typeof slotIndex === 'number' ? slotIndex : parseInt(slotIndex);
      if (isNaN(idx)) {
        console.error('Invalid slot index:', slotIndex);
        return;
      }

      // 1. Reset transient state first to avoid it being saved into the NEW slot key
      this.resetBattle();

      // 2. Sync load from storage to prevent race conditions with FSM transitions
      const saved = storage.load(STORAGE_KEYS.SESSION, idx);
      const snapshot = getSessionSnapshot(saved);

      if (snapshot) {
        // Apply the loaded data immediately
        this.$patch(snapshot);
      } else {
        // Reset to initial state for new games
        this.resetSession();
      }

      // 3. Setting activeSlot will trigger the persistencePlugin to maintain the correct key
      this.activeSlot = idx;
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
        trainerDefeatDialog: null,
        isStorm: false,
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
        position: { x: 3, y: 2 },
        currentArea: 1,
        currentInterior: 'home_2f',
        currentFloor: null,
        badges: [],
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
        words: {},
      };
    },

    updatePlayerPosition(pos: { x: number; y: number } | null) {
      this.player.position = pos;
    },

    healParty() {
      this.player.party.forEach(mon => { mon.hp = mon.maxHp; });
    },

    awardBadge(badge: string) {
      if (!this.player.badges.includes(badge)) {
        this.player.badges.push(badge);
      }
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

    recordDiscovery(type: keyof DexState, area: number, value: any) {
      if (type === 'discoveredTiles') {
        if (!this.dex.discoveredTiles[area]) this.dex.discoveredTiles[area] = [];
        if (!this.dex.discoveredTiles[area].includes(value)) {
          this.dex.discoveredTiles[area].push(value);
        }
      }
    },

    recordWord(area: number, word: string, status: WordStatus) {
      if (!this.dex.words[area]) this.dex.words[area] = {};
      const currentStatus = this.dex.words[area][word];

      // Mutually exclusive / Progressive status: mastered > correct > seen
      const statusPriority: Record<WordStatus, number> = { mastered: 3, correct: 2, seen: 1 };

      // Special case: if it is currently 'seen', we want to REPLACE it with 'correct' or 'mastered'.
      // If it is 'correct', we can upgrade to 'mastered'.
      // We NEVER downgrade.
      if (!currentStatus || statusPriority[status] > statusPriority[currentStatus]) {
        this.dex.words[area][word] = status;
      }
    },

    isAreaMastered(area: number, vocabCount: number): boolean {
      const words = this.dex.words[area];
      if (!words) return false;
      const masteredCount = Object.values(words).filter(s => s === 'mastered').length;
      return masteredCount >= vocabCount;
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

    recordTrainerDefeat(trainerId: string) {
      if (!this.player.defeatedTrainers.includes(trainerId)) {
        this.player.defeatedTrainers.push(trainerId);
      }
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
