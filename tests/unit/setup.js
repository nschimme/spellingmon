import { vi } from 'vitest';

vi.mock('../src/i18n', () => ({
  default: {
    global: {
      t: (key) => {
        // Simple mock translator that returns the last part of the key
        const parts = key.split('.');
        return parts[parts.length - 1];
      }
    }
  }
}));
