export const storage = {
  save(key, data, slot = null) {
    if (typeof window === 'undefined') return;
    const finalKey = slot !== null ? `${key}_slot_${slot}` : key;
    try {
      localStorage.setItem(finalKey, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  },
  load(key, slot = null) {
    if (typeof window === 'undefined') return null;
    const finalKey = slot !== null ? `${key}_slot_${slot}` : key;
    try {
      const data = localStorage.getItem(finalKey);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Storage load failed:', e);
      return null;
    }
  },
  remove(key) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Storage remove failed:', e);
    }
  }
};
