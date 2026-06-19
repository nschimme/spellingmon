import type { PiniaPluginContext } from 'pinia';
import { storage } from './storage';
import { STORAGE_KEYS } from './constants';

export interface PersistOptions {
  key: string;
  version: string;
  slotDependent?: boolean;
  migrate?: (data: any, version: string) => any;
  exclude?: string[];
}

declare module 'pinia' {
  export interface DefineStoreOptionsBase<S, Store> {
    persist?: PersistOptions;
  }
}

const debounceMap = new Map<string, ReturnType<typeof setTimeout>>();

export function persistencePlugin({ store, options }: PiniaPluginContext) {
  const persist = options.persist;
  if (!persist) return;

  const { key, version, slotDependent, migrate, exclude = [] } = persist;

  // Function to get the current slot if dependent
  const getSlot = () => {
    if (!slotDependent) return null;
    return storage.load(STORAGE_KEYS.ACTIVE_SLOT);
  };

  // 1. Load initial state
  const slot = getSlot();
  const saved = storage.load(key, slot);

  if (saved && saved.version) {
    let data = saved.data;
    if (saved.version !== version && migrate) {
      console.log(`Migrating ${key} from ${saved.version} to ${version}`);
      data = migrate(data, saved.version);
    }

    // Patch the store with loaded data, excluding keys if needed
    const patchedData = { ...data };
    exclude.forEach(k => delete patchedData[k]);
    store.$patch(patchedData);
  }

  // 2. Subscribe to changes
  store.$subscribe((mutation, state) => {
    const currentSlot = getSlot();
    const saveKey = slotDependent ? `${key}_slot_${currentSlot}` : key;

    if (debounceMap.has(saveKey)) {
      clearTimeout(debounceMap.get(saveKey));
    }

    const timeout = setTimeout(() => {
      const dataToSave = { ...state };
      exclude.forEach(k => delete dataToSave[k]);

      storage.save(key, {
        version,
        data: dataToSave
      }, currentSlot);

      debounceMap.delete(saveKey);
    }, 500); // 500ms debounce

    debounceMap.set(saveKey, timeout);
  });
}
