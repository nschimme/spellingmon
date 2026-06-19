import { AREA_CONFIGS } from './gameData';
import { BIOMES, TRANSITION_TYPES, GAME_CONSTANTS } from './constants';

const AREA_CONFIGS_MAX = GAME_CONSTANTS.MAX_AREAS;

/**
 * State-of-the-art Map Generator for Spellingmon
 * Uses BSP for room generation and Graph-based connectivity.
 */

export const TILE_TYPES = {
  EMPTY: 0,
  GRASS: 1,
  WALL: 2,
  WATER: 3,
  SPELL_CENTER: 4,
  TRAINER: 5,
  TRANSITION: 6,
  PATH: 7,
  CAVE_WALL: 8,
  BUILDING: 9,
};

export interface Point {
  x: number;
  y: number;
}

export interface Room {
  x: number;
  y: number;
  w: number;
  h: number;
  centerX: number;
  centerY: number;
}

export interface Transition extends Point {
  type: string;
}

export interface Trainer extends Point {
  name: string;
  dialog: string;
  party: Array<{ species: string; level: number }>;
  direction: string;
}

export interface MapResult {
  map: number[][];
  levelMap: number[][];
  spellCenter: Point | null;
  trainers: Trainer[];
  transitions: Transition[];
  biome: string;
}

class BSPNode {
  x: number;
  y: number;
  w: number;
  h: number;
  left: BSPNode | null = null;
  right: BSPNode | null = null;
  room: Room | null = null;

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
}

export class MapGenerator {
  seed: string;
  width: number;
  height: number;
  rng: () => number;

  constructor(seed: string, width = 100, height = 100) {
    this.seed = seed;
    this.width = width;
    this.height = height;
    this.rng = this.mulberry32(this.hashString(seed));
  }

  hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  mulberry32(a: number): () => number {
    return () => {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  random(): number {
    return this.rng();
  }

  randomRange(min: number, max: number): number {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  generate(areaNum: number, retryCount: number = 0): MapResult {
    const MAX_RETRIES = 10;
    const map = Array(this.height).fill(0).map(() => Array(this.width).fill(TILE_TYPES.WALL));
    const levelMap = Array(this.height).fill(0).map(() => Array(this.width).fill(0));
    const biome = this.getBiomeForArea(areaNum);

    // 1. Generate BSP Rooms
    const root = new BSPNode(2, 2, this.width - 4, this.height - 4);
    this.splitNode(root, 4); // 4 levels of splitting approx 16 rooms
    const leaves = this.getLeaves(root);
    const rooms: Room[] = [];

    leaves.forEach(node => {
      const w = this.randomRange(6, Math.min(15, node.w - 2));
      const h = this.randomRange(6, Math.min(15, node.h - 2));
      const x = node.x + this.randomRange(1, node.w - w - 1);
      const y = node.y + this.randomRange(1, node.h - h - 1);
      node.room = { x, y, w, h, centerX: Math.floor(x + w / 2), centerY: Math.floor(y + h / 2) };
      rooms.push(node.room);
      this.fillRoom(node.room, map, biome);
    });

    // 2. Connect Rooms
    this.connectNodes(root, map);

    // Add extra random corridors for multiple paths (Nethack style)
    for (let i = 0; i < rooms.length; i++) {
      if (this.random() > 0.6) {
        const r1 = rooms[i];
        const r2 = rooms[this.randomRange(0, rooms.length - 1)];
        if (r1 !== r2) {
          this.drawCorridor(map, r1.centerX, r1.centerY, r2.centerX, r2.centerY, TILE_TYPES.PATH);
        }
      }
    }

    // 3. Place Key Elements
    // Sort rooms by distance from top-left to get consistent entry/exit
    rooms.sort((a, b) => (a.x + a.y) - (b.x + b.y));
    const entryRoom = rooms[0];
    const exitRoom = rooms[rooms.length - 1];

    const transitions = [];
    if (areaNum > 1) {
      const tx = entryRoom.centerX;
      const ty = entryRoom.centerY;
      map[ty][tx] = TILE_TYPES.TRANSITION;
      transitions.push({ x: tx, y: ty, type: TRANSITION_TYPES.PREV } as any);
    }

    let nextTransition: Transition | undefined = undefined;
    if (areaNum < AREA_CONFIGS_MAX) {
      const tx = exitRoom.centerX;
      const ty = exitRoom.centerY;
      map[ty][tx] = TILE_TYPES.TRANSITION;
      nextTransition = { x: tx, y: ty, type: TRANSITION_TYPES.NEXT } as any;
      transitions.push(nextTransition);
    }

    let spellCenter: Point | null = null;
    // Every area now has a SpellCenter in the entry room for easy access
    const scRoom = entryRoom;
    spellCenter = { x: scRoom.centerX, y: scRoom.centerY };
    // Offset from transition if they land on same tile
    if (map[spellCenter.y][spellCenter.x] === TILE_TYPES.TRANSITION) {
      if (spellCenter.x + 1 < scRoom.x + scRoom.w) spellCenter.x++;
      else if (spellCenter.x - 1 >= scRoom.x) spellCenter.x--;
      else if (spellCenter.y + 1 < scRoom.y + scRoom.h) spellCenter.y++;
      else if (spellCenter.y - 1 >= scRoom.y) spellCenter.y--;
    }
    map[spellCenter.y][spellCenter.x] = TILE_TYPES.SPELL_CENTER;

    const trainers = this.placeTrainers(rooms, map, areaNum, transitions, spellCenter);

    // 4. Features
    this.addFeatures(map, biome);

    // 5. Reachability Check
    if (!this.isMapNavigable(map, transitions, spellCenter)) {
      if (retryCount < MAX_RETRIES) {
        console.warn(`Map generation failed reachability check for area ${areaNum} (attempt ${retryCount + 1}/${MAX_RETRIES}). Retrying with new seed...`);
        // If map is invalid, retry with a slightly modified seed
        this.seed = this.seed + "_retry" + retryCount;
        this.rng = this.mulberry32(this.hashString(this.seed));
        return this.generate(areaNum, retryCount + 1);
      } else {
        console.error(`Map generation failed after ${MAX_RETRIES} attempts for area ${areaNum}. Using potentially disconnected map.`);
      }
    }

    // 6. Level Map generation
    this.generateLevelMap(map, levelMap, areaNum, entryRoom);

    return {
      map,
      levelMap,
      spellCenter,
      trainers,
      transitions,
      biome
    };
  }

  isMapNavigable(map: number[][], transitions: Transition[], spellCenter: Point | null): boolean {
    if (transitions.length === 0) return true;

    const start = transitions[0];
    const targets = [...transitions.slice(1)];
    if (spellCenter) targets.push(spellCenter as any);

    if (targets.length === 0) return true;

    const walkable = [TILE_TYPES.PATH, TILE_TYPES.EMPTY, TILE_TYPES.GRASS, TILE_TYPES.SPELL_CENTER, TILE_TYPES.TRAINER, TILE_TYPES.TRANSITION];

    const checkReachability = (from: Point, to: Point) => {
      const queue: [number, number][] = [[from.x, from.y]];
      const visited = new Set([`${from.x},${from.y}`]);

      while (queue.length > 0) {
        const [x, y] = queue.shift()!;
        if (x === to.x && y === to.y) return true;

        const neighbors = [[x+1, y], [x-1, y], [x, y+1], [x, y-1]];
        for (const [nx, ny] of neighbors) {
          if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
            const key = `${nx},${ny}`;
            if (walkable.includes(map[ny][nx]) && !visited.has(key)) {
              visited.add(key);
              queue.push([nx, ny]);
            }
          }
        }
      }
      return false;
    };

    return targets.every(target => checkReachability(start, target));
  }

  splitNode(node: BSPNode, depth: number): void {
    if (depth <= 0) return;

    let splitHorizontal = this.random() > 0.5;
    if (node.w > node.h * 1.5) splitHorizontal = false;
    else if (node.h > node.w * 1.5) splitHorizontal = true;

    const minSize = 10;
    if (splitHorizontal) {
      if (node.h < minSize * 2) return;
      const split = this.randomRange(minSize, node.h - minSize);
      node.left = new BSPNode(node.x, node.y, node.w, split);
      node.right = new BSPNode(node.x, node.y + split, node.w, node.h - split);
    } else {
      if (node.w < minSize * 2) return;
      const split = this.randomRange(minSize, node.w - minSize);
      node.left = new BSPNode(node.x, node.y, split, node.h);
      node.right = new BSPNode(node.x + split, node.y, node.w - split, node.h);
    }

    this.splitNode(node.left, depth - 1);
    this.splitNode(node.right, depth - 1);
  }

  getLeaves(node: BSPNode): BSPNode[] {
    if (!node.left && !node.right) return [node];
    const leaves: BSPNode[] = [];
    if (node.left) leaves.push(...this.getLeaves(node.left));
    if (node.right) leaves.push(...this.getLeaves(node.right));
    return leaves;
  }

  fillRoom(room: Room, map: number[][], biome: string): void {
    const type = biome === BIOMES.CAVE ? TILE_TYPES.EMPTY : TILE_TYPES.PATH;
    for (let y = room.y; y < room.y + room.h; y++) {
      for (let x = room.x; x < room.x + room.w; x++) {
        map[y][x] = type;
      }
    }
  }

  connectNodes(node: BSPNode, map: number[][]): void {
    if (node.left && node.right) {
      const r1 = this.findClosestRoom(node.left);
      const r2 = this.findClosestRoom(node.right);
      this.drawCorridor(map, r1.centerX, r1.centerY, r2.centerX, r2.centerY, TILE_TYPES.PATH);
      this.connectNodes(node.left, map);
      this.connectNodes(node.right, map);
    }
  }

  findClosestRoom(node: BSPNode): Room {
    if (node.room) return node.room;
    // Arbitrarily pick from left or right child to find a room in sub-tree
    return this.findClosestRoom(node.left || node.right!);
  }

  drawCorridor(map: number[][], x1: number, y1: number, x2: number, y2: number, type: number): void {
    let x = x1;
    let y = y1;

    while (x !== x2) {
      map[y][x] = type;
      if (y + 1 < this.height && map[y+1][x] === TILE_TYPES.WALL) map[y + 1][x] = type;
      x += x1 < x2 ? 1 : -1;
    }
    while (y !== y2) {
      map[y][x] = type;
      if (x + 1 < this.width && map[y][x+1] === TILE_TYPES.WALL) map[y][x + 1] = type;
      y += y1 < y2 ? 1 : -1;
    }
  }

  placeTrainers(rooms: Room[], map: number[][], areaNum: number, transitions: Transition[], spellCenter: Point | null): Trainer[] {
    const trainers: Trainer[] = [];
    const count = this.randomRange(8, 12);
    const titles = ['Spelling Bee', 'Grammar Geek', 'Vocab Victor', 'Linguist', 'Prose Pro', 'Word Wizard', 'Syntax Sage', 'Lexis Legend'];
    const names = ['Alex', 'Jordan', 'Taylor', 'Casey', 'Robin', 'Jamie', 'Morgan', 'Quinn', 'Skyler', 'Sasha'];
    const dialogs = [
      "I'll teach you a lesson in spelling!",
      "My party is perfectly punctuated!",
      "Can you define 'defeat'?",
      "Your syntax is full of errors!",
      "I've been studying this route for weeks.",
      "Words are my strongest weapons!",
      "A well-placed comma could save your life.",
      "You're about to be edited out of the game!"
    ];

    const occupied = [...transitions, spellCenter].filter(Boolean);
    const directions = ['up', 'down', 'left', 'right'];

    for (let i = 0; i < count; i++) {
      const room = rooms[this.randomRange(0, rooms.length - 1)];
      const x = room.centerX + this.randomRange(-1, 1);
      const y = room.centerY + this.randomRange(-1, 1);

      // Boundary check
      if (x < 1 || x >= this.width - 1 || y < 1 || y >= this.height - 1) continue;

      const isOccupied = occupied.some(o => Math.abs(o!.x - x) < 3 && Math.abs(o!.y - y) < 3) || map[y][x] !== TILE_TYPES.PATH;
      if (!isOccupied) {
        map[y][x] = TILE_TYPES.TRAINER;
        occupied.push({ x, y });

        const title = titles[this.randomRange(0, titles.length - 1)];
        const name = names[this.randomRange(0, names.length - 1)];
        const dialog = dialogs[this.randomRange(0, dialogs.length - 1)];
        const direction = directions[this.randomRange(0, directions.length - 1)];

        const area = AREA_CONFIGS[areaNum];
        const level = area.maxLevel;

        // Scale party size based on area
        let partySize = 1;
        if (areaNum <= 2) partySize = this.randomRange(1, 2);
        else if (areaNum <= 4) partySize = this.randomRange(2, 4);
        else partySize = this.randomRange(3, 6);

        const party = [];
        for (let j = 0; j < partySize; j++) {
          const species = area.encounters[this.randomRange(0, area.encounters.length - 1)];
          party.push({ species, level });
        }

        trainers.push({
          x, y,
          name: `${title} ${name}`,
          dialog,
          party,
          direction
        });
      }
    }
    return trainers;
  }

  addFeatures(map: number[][], biome: string): void {
    const grassChance = biome === BIOMES.FOREST ? 0.2 : (biome === BIOMES.CAVE ? 0.025 : 0.07);
    const waterChance = biome === BIOMES.WILDERNESS ? 0.02 : 0.005;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (map[y][x] === TILE_TYPES.WALL) {
          if (this.random() < waterChance) this.floodFill(map, x, y, TILE_TYPES.WATER, 3, [TILE_TYPES.WALL]);
        } else if (map[y][x] === TILE_TYPES.PATH || map[y][x] === TILE_TYPES.EMPTY) {
          if (this.random() < grassChance) {
             // Grass can only overwrite Path or Empty, never Water, Transitions or SpellCenters
             this.floodFill(map, x, y, TILE_TYPES.GRASS, this.randomRange(2, 5), [TILE_TYPES.PATH, TILE_TYPES.EMPTY]);
          }
        }
      }
    }
  }

  floodFill(map: number[][], x: number, y: number, type: number, size: number, allowedOverwrites: number[] | null = null): void {
    if (size <= 0 || x < 0 || y < 0 || x >= this.width || y >= this.height) return;

    if (allowedOverwrites && !allowedOverwrites.includes(map[y][x])) return;

    map[y][x] = type;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    // Branch out in random directions to create more natural patches
    for (const [dx, dy] of dirs) {
      if (this.random() > 0.5) {
        this.floodFill(map, x + dx, y + dy, type, size - 1, allowedOverwrites);
      }
    }
  }

  getBiomeForArea(area: number): string {
    return AREA_CONFIGS[area]?.biome || BIOMES.ROUTE;
  }

  generateLevelMap(map: number[][], levelMap: number[][], areaNum: number, entryRoom: Room): void {
    const config = AREA_CONFIGS[areaNum];
    const min = config.minLevel;
    const max = config.maxLevel;

    const queue: [number, number, number][] = [[entryRoom.centerX, entryRoom.centerY, 0]];
    const visited = new Set<string>();
    visited.add(`${entryRoom.centerX},${entryRoom.centerY}`);

    let maxDist = 0;
    const distances: Array<{ x: number; y: number; d: number }> = [];

    const walkable = [TILE_TYPES.PATH, TILE_TYPES.EMPTY, TILE_TYPES.GRASS, TILE_TYPES.SPELL_CENTER, TILE_TYPES.TRAINER, TILE_TYPES.TRANSITION];

    while (queue.length > 0) {
      const [x, y, d] = queue.shift()!;
      distances.push({ x, y, d });
      if (d > maxDist) maxDist = d;

      const neighbors = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          if (walkable.includes(map[ny][nx]) && !visited.has(`${nx},${ny}`)) {
            visited.add(`${nx},${ny}`);
            queue.push([nx, ny, d + 1]);
          }
        }
      }
    }

    distances.forEach(({ x, y, d }) => {
      const progress = d / (maxDist || 1);
      // Level increases with distance, with some randomness
      let level = Math.floor(min + progress * (max - min));

      // Add "Risk" factor based on tile type or random patches
      if (map[y][x] === TILE_TYPES.GRASS && this.random() > 0.8) {
        level += 1;
      }

      levelMap[y][x] = Math.max(min, Math.min(max, level));
    });
  }
}
