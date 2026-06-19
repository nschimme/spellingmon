import { vi } from 'vitest';

vi.mock('../src/i18n', () => ({
  default: {
    global: {
      t: (key, params) => {
        // Simple mock translator that returns the last part of the key
        // and includes params if any (very basic)
        const parts = key.split('.');
        let result = parts[parts.length - 1];
        if (params) {
           Object.keys(params).forEach(p => {
             result = result.replace(`{${p}}`, params[p]);
           });
        }
        return result;
      }
    }
  }
}));
