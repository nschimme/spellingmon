import { describe, it, expect, vi, beforeEach } from 'vitest';
import { persistencePlugin } from '../../src/utils/persistencePlugin';
import { storage } from '../../src/utils/storage';

describe('persistencePlugin Unit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(storage, 'load').mockReturnValue(null);
    vi.spyOn(storage, 'save').mockImplementation(() => {});
  });

  it('calls storage.load with correct key on initialization', () => {
    const mockStore = {
      $id: 'test-store',
      $patch: vi.fn(),
      $subscribe: vi.fn(),
    };

    const mockOptions = {
      persist: {
        key: 'test-key',
        version: '1.0.0',
      }
    };

    persistencePlugin({ store: mockStore, options: mockOptions } as any);

    expect(storage.load).toHaveBeenCalledWith('test-key', null);
  });

  it('applies migration if versions mismatch', () => {
    const oldData = { version: '0.9.0', data: { val: 1 } };
    vi.mocked(storage.load).mockReturnValue(oldData);

    const migrate = vi.fn().mockReturnValue({ val: 2 });
    const mockStore = {
      $id: 'test-store',
      $patch: vi.fn(),
      $subscribe: vi.fn(),
    };

    const mockOptions = {
      persist: {
        key: 'test-key',
        version: '1.0.0',
        migrate
      }
    };

    persistencePlugin({ store: mockStore, options: mockOptions } as any);

    expect(migrate).toHaveBeenCalledWith({ val: 1 }, '0.9.0');
    expect(mockStore.$patch).toHaveBeenCalledWith({ val: 2 });
  });

  it('sanitizes data on load', () => {
    const data = { version: '1.0.0', data: { val: 1 } };
    vi.mocked(storage.load).mockReturnValue(data);

    const sanitize = vi.fn().mockReturnValue({ val: 1, sanitized: true });
    const mockStore = {
      $id: 'test-store',
      $patch: vi.fn(),
      $subscribe: vi.fn(),
    };

    const mockOptions = {
      persist: {
        key: 'test-key',
        version: '1.0.0',
        sanitize
      }
    };

    persistencePlugin({ store: mockStore, options: mockOptions } as any);

    expect(sanitize).toHaveBeenCalledWith({ val: 1 });
    expect(mockStore.$patch).toHaveBeenCalledWith({ val: 1, sanitized: true });
  });
});
