import { describe, it, expect, beforeEach } from 'vitest';
import { MapGenerator, TILE_TYPES } from '../../src/utils/mapGenerator';

describe('Interior and NPC System', () => {
  let gen: MapGenerator;

  beforeEach(() => {
    gen = new MapGenerator('test-seed', 100, 100);
  });

  it('generates interiors for Area 1', () => {
    const interiors = gen.generateInteriors(1);
    expect(interiors).toHaveProperty('home_1f');
    expect(interiors).toHaveProperty('home_2f');
    expect(interiors).toHaveProperty('spelling_center');
    expect(interiors).toHaveProperty('gym');
  });

  it('marks NPC tiles correctly on interior maps', () => {
    const interiors = gen.generateInteriors(1);
    const home1f = interiors['home_1f'];
    const mom = home1f.npcs.find(n => n.id === 'mom');
    expect(mom).toBeDefined();
    expect(home1f.map[mom!.y][mom!.x]).toBe(TILE_TYPES.NPC);
  });

  it('includes interiors in the full map result', () => {
    const result = gen.generate(1);
    expect(result.interiors).toBeDefined();
    expect(result.interiors).toHaveProperty('home_1f');
  });

  it('correctly maps building doors to interior world exits', () => {
    const result = gen.generate(1);
    const interiors = result.interiors!;

    // Check Home 1F world exit has been updated with a non-zero targetPos
    const homeExit = interiors['home_1f'].exits.find(e => e.target === 'world');
    expect(homeExit).toBeDefined();
    expect(homeExit!.targetPos.x).toBeGreaterThan(0);
    expect(homeExit!.targetPos.y).toBeGreaterThan(0);
  });
});
