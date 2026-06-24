import type { PiniaPluginContext } from 'pinia';
import { storage } from './storage';
import { GAME_CONSTANTS } from './constants';

export interface PersistOptions {
  key: string;
  version: string;
  slotDependent?: boolean;
  migrate?: (data: any, version: string) => any;
  sanitize?: (data: any) => any;
  exclude?: string[];
}

declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: PersistOptions;
  }
}

const debounceMap = new Map<string, ReturnType<typeof setTimeout>>();

// Module-level cache for the active slot to avoid repeated storage access across all stores
let cachedActiveSlot: number | null | undefined = undefined;

/**
 * Reset module-level cache for testing purposes.
 */
export function _resetPersistenceCache() {
  cachedActiveSlot = undefined;
  debounceMap.forEach(t => clearTimeout(t));
  debounceMap.clear();
}

export function persistencePlugin({ store, options }: PiniaPluginContext) {
  const persist = options.persist;
  if (!persist) return;

  const { key, version, slotDependent, migrate, sanitize, exclude = [] } = persist;

  // Helper to resolve the storage key (matches storage.ts logic)
  const resolvePersistenceKey = (baseKey: string, slot: number | null | undefined) => {
    if (!slotDependent || slot == null) return baseKey;
    return `${baseKey}_slot_${slot}`;
  };

  const getSlot = () => {
    if (!slotDependent) return null;
    if (cachedActiveSlot === undefined) {
      // In-memory only. We no longer load from storage to support "back to landing on refresh"
      cachedActiveSlot = null;
    }
    return cachedActiveSlot;
  };

  const loadAndPatch = () => {
    const slot = getSlot();
    const saved = storage.load(key, slot);

    if (saved && saved.version) {
      let data = saved.data;
      if (saved.version !== version) {
        if (migrate) {
          console.log(`Migrating ${key} from ${saved.version} to ${version}`);
          data = migrate(data, saved.version);
        } else {
          console.warn(`Version mismatch for ${key} (${saved.version} vs ${version}) and no migrate function provided. Skipping patch.`);
          return;
        }
      }

      if (sanitize) {
        try {
          data = sanitize(data);
          if (!data) {
            console.warn(`Sanitizer rejected loaded data for ${key}.`);
            return;
          }
        } catch (err) {
          console.error(`Sanitization failed for ${key} during load:`, err);
          return;
        }
      }

      // Patch the store with loaded data, excluding keys if needed
      const patchedData = { ...data };
      exclude.forEach(k => delete patchedData[k]);
      store.$patch(patchedData);
    } else if (slotDependent && slot != null) {
      // If we are switching slots and no data is found, reset to initial state
      // to avoid leakage from the previous slot.
      if (typeof (store as any).resetSession === 'function') {
        (store as any).resetSession();
      } else {
        try {
          store.$reset();
        } catch {
          console.warn(`Could not reset store ${store.$id} after slot change.`);
        }
      }
    }
  };

  // 1. Initial Load
  loadAndPatch();

  // 2. Subscribe to changes
  store.$subscribe((_mutation, state) => {
    // Sync cached slot and handle slot switching
    if (store.$id === 'session' && 'activeSlot' in state) {
      const rawSlot = (state as any).activeSlot;
      const newSlot = (rawSlot != null && !isNaN(parseInt(rawSlot))) ? parseInt(rawSlot) : null;

      if (newSlot !== cachedActiveSlot) {
        cachedActiveSlot = newSlot;
        // If this store is slot-dependent, we reload it immediately
        if (slotDependent) {
          loadAndPatch();
        }
      }
    }

    const currentSlot = getSlot();

    // Short-circuit if slotDependent but no slot is active
    if (slotDependent && currentSlot == null) return;

    const saveKey = resolvePersistenceKey(key, currentSlot);

    if (debounceMap.has(saveKey)) {
      clearTimeout(debounceMap.get(saveKey));
    }

    const timeout = setTimeout(() => {
      let dataToSave = { ...state };
      exclude.forEach(k => delete dataToSave[k]);

      if (sanitize) {
        try {
          dataToSave = sanitize(dataToSave);
        } catch (err) {
          console.error(`Sanitization failed for ${key} during save:`, err);
        }
      }

      storage.save(key, {
        version,
        data: dataToSave
      }, currentSlot);

      debounceMap.delete(saveKey);
    }, GAME_CONSTANTS.SAVE_DEBOUNCE_MS);

    debounceMap.set(saveKey, timeout);
  });

  // Special handling for slot switching:
  // If this store is slotDependent, we should watch for session.activeSlot changes.
  // Since we don't have easy access to other stores here via Pinia without creating circular deps,
  // we can use the same $subscribe on session store if we are NOT the session store.
  if (slotDependent && store.$id !== 'session') {
    // This is a bit tricky as we don't have the session store instance here yet.
    // Most slot-dependent logic is currently in the session store itself anyway.
  }
}
