export const storage = {
  save(key: string, data: any, slot: number | string | null = null) {
    if (typeof window === 'undefined' || data === undefined) return;
    const finalKey = (slot !== null && slot !== undefined) ? `${key}_slot_${slot}` : key;
    try {
      localStorage.setItem(finalKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  },
  load(key: string, slot: number | string | null = null) {
    if (typeof window === 'undefined') return null;
    const finalKey = (slot !== null && slot !== undefined) ? `${key}_slot_${slot}` : key;
    try {
      const data = localStorage.getItem(finalKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Storage load failed:', e);
      return null;
    }
  },
  remove(key: string, slot: number | string | null = null) {
    if (typeof window === 'undefined') return;
    const finalKey = (slot !== null && slot !== undefined) ? `${key}_slot_${slot}` : key;
    try {
      localStorage.removeItem(finalKey);
    } catch (e) {
      console.warn('Storage remove failed:', e);
    }
  }
};
