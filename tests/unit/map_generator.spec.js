import { describe, it, expect } from 'vitest';
import { MapGenerator, TILE_TYPES } from '../../src/utils/mapGenerator';
import { BIOMES, TRANSITION_TYPES } from '../../src/utils/constants';

describe('MapGenerator', () => {
  it('generates consistent maps for the same seed', () => {
    const gen1 = new MapGenerator('test-seed', 20, 20);
    const gen2 = new MapGenerator('test-seed', 20, 20);

    const result1 = gen1.generate(1);
    const result2 = gen2.generate(1);

    expect(result1.map).toEqual(result2.map);
    expect(result1.spellCenter).toEqual(result2.spellCenter);
  });

  it('generates different maps for different seeds', () => {
    const gen1 = new MapGenerator('seed-1', 20, 20);
    const gen2 = new MapGenerator('seed-2', 20, 20);

    const result1 = gen1.generate(1);
    const result2 = gen2.generate(1);

    expect(result1.map).not.toEqual(result2.map);
  });

  it('places a spell center and transitions', () => {
    const gen = new MapGenerator('seed', 50, 50);
    const result = gen.generate(2); // Route 2 has both transitions

    expect(result.spellCenter).toBeDefined();
    expect(result.transitions.length).toBe(2);

    const { x, y } = result.spellCenter;
    expect(result.map[y][x]).toBe(TILE_TYPES.SPELL_CENTER);
  });

  it('generates specific biomes', () => {
    const gen = new MapGenerator('seed', 20, 20);
    expect(gen.getBiomeForArea(1)).toBe(BIOMES.WILDERNESS);
    expect(gen.getBiomeForArea(2)).toBe(BIOMES.CAVE);
    expect(gen.getBiomeForArea(3)).toBe(BIOMES.TOWN);
  });

  it('ensures transitions are on the edges', () => {
    const gen = new MapGenerator('seed', 20, 20);
    const result = gen.generate(2);

    for (const trans of result.transitions) {
      if (trans.type === TRANSITION_TYPES.PREV) expect(trans.x).toBe(0);
      if (trans.type === TRANSITION_TYPES.NEXT) expect(trans.x).toBe(19);
    }
  });

  it('ensures connectivity between transitions', () => {
    const gen = new MapGenerator('test-seed-connectivity', 50, 50);
    const result = gen.generate(2); // Route 2 has both transitions

    const start = result.transitions.find(t => t.type === TRANSITION_TYPES.PREV);
    const end = result.transitions.find(t => t.type === TRANSITION_TYPES.NEXT);

    const connected = gen.isConnected(result.map, start.x, start.y, end.x, end.y);
    expect(connected).toBe(true);
  });
});
