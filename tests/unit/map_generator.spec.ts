import { describe, it, expect } from 'vitest';
import { MapGenerator, TILE_TYPES } from '../../src/utils/mapGenerator';
import { BIOMES, TRANSITION_TYPES } from '../../src/utils/constants';

describe('MapGenerator (State-of-the-art)', () => {
  it('generates consistent maps for the same seed', () => {
    const gen1 = new MapGenerator('test-seed', 40, 40);
    const gen2 = new MapGenerator('test-seed', 40, 40);

    const result1 = gen1.generate(1);
    const result2 = gen2.generate(1);

    expect(result1.map).toEqual(result2.map);
    expect(result1.spellCenter).toEqual(result2.spellCenter);
  });

  it('generates different maps for different seeds', () => {
    const gen1 = new MapGenerator('seed-1', 40, 40);
    const gen2 = new MapGenerator('seed-2', 40, 40);

    const result1 = gen1.generate(1);
    const result2 = gen2.generate(1);

    expect(result1.map).not.toEqual(result2.map);
  });

  it('places a spell center and transitions within rooms', () => {
    const gen = new MapGenerator('seed', 60, 60);
    const result = gen.generate(2); // Route 2 has both transitions

    expect(result.spellCenter).toBeDefined();
    expect(result.transitions.length).toBe(2);

    const { x, y } = result.spellCenter;
    expect(result.map[y][x]).toBe(TILE_TYPES.SPELL_CENTER);

    // Transitions should NOT be at edges 0 or width-1 anymore
    for (const trans of result.transitions) {
        expect(trans.x).toBeGreaterThan(0);
        expect(trans.x).toBeLessThan(59);
        expect(trans.y).toBeGreaterThan(0);
        expect(trans.y).toBeLessThan(59);
    }
  });

  it('generates specific biomes', () => {
    const gen = new MapGenerator('seed', 40, 40);
    expect(gen.getBiomeForArea(1)).toBe(BIOMES.ROUTE);
    expect(gen.getBiomeForArea(2)).toBe(BIOMES.TOWN);
    expect(gen.getBiomeForArea(3)).toBe(BIOMES.WILDERNESS);
  });

  it('generates a valid levelMap', () => {
    const gen = new MapGenerator('seed', 50, 50);
    const result = gen.generate(1);

    expect(result.levelMap).toBeDefined();
    expect(result.levelMap.length).toBe(50);
    expect(result.levelMap[0].length).toBe(50);

    // Check if level at spell center is min level
    const { x, y } = result.spellCenter;
    expect(result.levelMap[y][x]).toBe(1); // Area 1 minLevel is now 1
  });

  it('ensures connectivity with BFS', () => {
    const gen = new MapGenerator('connectivity-test', 60, 60);
    const result = gen.generate(2);

    const start = result.transitions.find(t => t.type === TRANSITION_TYPES.PREV);
    const end = result.transitions.find(t => t.type === TRANSITION_TYPES.NEXT);

    // Manual BFS to check connectivity since isConnected was removed from MapGenerator
    const isConnected = (map, x1, y1, x2, y2) => {
        const queue = [[x1, y1]];
        const visited = new Set();
        visited.add(`${x1},${y1}`);
        const walkable = [TILE_TYPES.PATH, TILE_TYPES.EMPTY, TILE_TYPES.GRASS, TILE_TYPES.SPELL_CENTER, TILE_TYPES.TRAINER, TILE_TYPES.TRANSITION];

        while (queue.length > 0) {
            const [x, y] = queue.shift();
            if (x === x2 && y === y2) return true;
            const neighbors = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
            for (const [nx, ny] of neighbors) {
                if (nx >= 0 && nx < 60 && ny >= 0 && ny < 60) {
                    if (walkable.includes(map[ny][nx]) && !visited.has(`${nx},${ny}`)) {
                        visited.add(`${nx},${ny}`);
                        queue.push([nx, ny]);
                    }
                }
            }
        }
        return false;
    };

    expect(isConnected(result.map, start.x, start.y, end.x, end.y)).toBe(true);
  });

  it('generates grass in patches rather than single tiles', () => {
    const gen = new MapGenerator('grass-patch-test', 60, 60);
    const result = gen.generate(1);

    // Count total grass tiles
    let totalGrass = 0;
    const grassTiles = [];
    for (let y = 0; y < 60; y++) {
      for (let x = 0; x < 60; x++) {
        if (result.map[y][x] === TILE_TYPES.GRASS) {
          totalGrass++;
          grassTiles.push({x, y});
        }
      }
    }

    expect(totalGrass).toBeGreaterThan(0);

    // Check if grass tiles have at least one grass neighbor (mostly)
    // Some isolated patches of size 1 might still exist if rng is very unlucky but rare
    let withNeighbor = 0;
    for (const {x, y} of grassTiles) {
      const neighbors = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];
      const hasGrassNeighbor = neighbors.some(([nx, ny]) =>
        nx >= 0 && nx < 60 && ny >= 0 && ny < 60 && result.map[ny][nx] === TILE_TYPES.GRASS
      );
      if (hasGrassNeighbor) withNeighbor++;
    }

    // With flood fill size 2-5, majority should have neighbors
    expect(withNeighbor / totalGrass).toBeGreaterThan(0.7);
  });
});
