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

import { sanitizeSessionData } from '../../src/stores/sessionStore';

describe('sanitizeSessionData Unit', () => {
  it('reconstructs missing player and monster fields for older saves', () => {
    const rawData = {
      player: {
        name: 'OldSavePlayer',
        party: [
          {
            species: 'Grammander',
            level: 5,
            // missing types, id, stats, maxHp, hp, status, stages, etc.
          }
        ]
      }
    };

    const sanitized = sanitizeSessionData(rawData as any);

    // Verify player list properties are initialized
    expect(sanitized.player.badges).toEqual([]);
    expect(sanitized.player.unlockedAreas).toEqual([1]);
    expect(sanitized.player.defeatedTrainers).toEqual([]);

    // Verify monster properties are fully reconstructed
    const mon = sanitized.player.party[0];
    expect(mon.types).toContain('Fire');
    expect(mon.id).toBeDefined();
    expect(mon.maxHp).toBeGreaterThan(0);
    expect(mon.hp).toEqual(mon.maxHp);
    expect(mon.atk).toBeGreaterThan(0);
    expect(mon.def).toBeGreaterThan(0);
    expect(mon.spa).toBeGreaterThan(0);
    expect(mon.spd).toBeGreaterThan(0);
    expect(mon.spe).toBeGreaterThan(0);
    expect(mon.exp).toEqual(0);
    expect(mon.expToNext).toBeGreaterThan(0);
    expect(mon.status).toEqual('NONE');
    expect(mon.stages).toEqual({ atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });

    // Verify move reconstruction behavior
    expect(mon.moves).toBeDefined();
    expect(Array.isArray(mon.moves)).toBe(true);
    expect(mon.moves.length).toBe(2);
    expect(mon.moves).toContain('Growl');
    expect(mon.moves).toContain('Tackle');
  });
});
