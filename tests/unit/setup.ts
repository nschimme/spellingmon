import { vi } from 'vitest';
import { config } from '@vue/test-utils';

// Helper for i18n keys
const translate = (key: string, params?: any) => {
  const parts = key.split('.');
  let result = parts[parts.length - 1];
  if (params) {
     Object.keys(params).forEach(p => {
       result = result.replace(`{${p}}`, params[p]);
     });
  }
  return result;
};

// Global i18n mock for components
config.global.mocks = {
  $t: translate
};

vi.mock('../src/i18n', () => ({
  default: {
    global: {
      t: translate
    }
  }
}));
