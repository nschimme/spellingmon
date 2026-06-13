import { AREA_CONFIGS } from './gameData';
import { BIOMES, TRANSITION_TYPES } from './constants';

/**
 * Procedural Map Generator for Spellingmon
 * Inspired by Nethack/Pokemon. Generates large maps with biomes.
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

export class MapGenerator {
  constructor(seed, width = 100, height = 100) {
    this.seed = seed;
    this.width = width;
    this.height = height;
    this.rng = this.mulberry32(this.hashString(seed));
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }

  mulberry32(a) {
    return () => {
      let t = a += 0x6D2B79F5;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  random() {
    return this.rng();
  }

  randomRange(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  generate(areaNum) {
    const map = Array(this.height).fill(0).map(() => Array(this.width).fill(TILE_TYPES.WALL));
    const biome = this.getBiomeForArea(areaNum);

    // 1. Generate Rooms/Main Areas
    const rooms = this.generateRooms(biome);

    // 2. Connect Rooms with Paths
    this.connectRooms(rooms, map, biome);

    // 3. Fill Rooms
    this.fillRooms(rooms, map, biome);

    // 4. Place Transitions and Connect them
    const transitions = this.placeTransitions(map, areaNum);
    this.connectTransitions(transitions, rooms, map);

    // 5. Place Key Elements
    const spellCenter = this.placeSpellCenter(rooms, map);
    const trainers = this.placeTrainers(rooms, map, areaNum, biome);

    // 6. Add Natural features (Grass, Water)
    this.addFeatures(map, biome);

    // 7. Validate connectivity
    if (areaNum > 1 && areaNum < 5) {
      const start = transitions.find(t => t.type === TRANSITION_TYPES.PREV);
      const end = transitions.find(t => t.type === TRANSITION_TYPES.NEXT);
      if (start && end && !this.isConnected(map, start.x, start.y, end.x, end.y)) {
        // Simple fix: if not connected, draw a straight path between them
        this.drawCorridor(map, start.x, start.y, end.x, end.y, TILE_TYPES.PATH);
      }
    }

    return {
      map,
      spellCenter,
      trainers,
      transitions,
      biome
    };
  }

  isConnected(map, x1, y1, x2, y2) {
    const queue = [[x1, y1]];
    const visited = new Set();
    visited.add(`${x1},${y1}`);

    const walkable = [TILE_TYPES.PATH, TILE_TYPES.EMPTY, TILE_TYPES.GRASS, TILE_TYPES.SPELL_CENTER, TILE_TYPES.TRAINER, TILE_TYPES.TRANSITION];

    while (queue.length > 0) {
      const [x, y] = queue.shift();
      if (x === x2 && y === y2) return true;

      const neighbors = [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]];
      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          const type = map[ny][nx];
          if (walkable.includes(type) && !visited.has(`${nx},${ny}`)) {
            visited.add(`${nx},${ny}`);
            queue.push([nx, ny]);
          }
        }
      }
    }
    return false;
  }

  getBiomeForArea(area) {
    const biomes = [BIOMES.WILDERNESS, BIOMES.CAVE, BIOMES.TOWN, BIOMES.ROUTE, BIOMES.FOREST];
    return biomes[(area - 1) % biomes.length];
  }

  generateRooms(biome) {
    const rooms = [];
    const count = biome === BIOMES.TOWN ? 12 : 8;
    for (let i = 0; i < count; i++) {
      rooms.push({
        x: this.randomRange(5, this.width - 20),
        y: this.randomRange(5, this.height - 20),
        w: this.randomRange(6, 12),
        h: this.randomRange(6, 12)
      });
    }
    return rooms;
  }

  connectRooms(rooms, map, biome) {
    for (let i = 0; i < rooms.length - 1; i++) {
      let x1 = rooms[i].x + Math.floor(rooms[i].w / 2);
      let y1 = rooms[i].y + Math.floor(rooms[i].h / 2);
      let x2 = rooms[i + 1].x + Math.floor(rooms[i + 1].w / 2);
      let y2 = rooms[i + 1].y + Math.floor(rooms[i + 1].h / 2);

      this.drawCorridor(map, x1, y1, x2, y2, TILE_TYPES.PATH);
    }
  }

  drawCorridor(map, x1, y1, x2, y2, type) {
    let x = x1;
    let y = y1;

    while (x !== x2) {
      map[y][x] = type;
      if (y + 1 < this.height) map[y + 1][x] = type; // Thicker paths
      x += x1 < x2 ? 1 : -1;
    }
    while (y !== y2) {
      map[y][x] = type;
      if (x + 1 < this.width) map[y][x + 1] = type;
      y += y1 < y2 ? 1 : -1;
    }
  }

  fillRooms(rooms, map, biome) {
    rooms.forEach(room => {
      const type = biome === BIOMES.CAVE ? TILE_TYPES.EMPTY : TILE_TYPES.PATH;
      for (let y = room.y; y < room.y + room.h; y++) {
        for (let x = room.x; x < room.x + room.w; x++) {
          map[y][x] = type;
        }
      }
      if (biome === BIOMES.TOWN && this.random() > 0.5) {
        this.placeBuilding(room, map);
      }
    });
  }

  placeBuilding(room, map) {
    const bw = 4;
    const bh = 4;
    const bx = room.x + 1;
    const by = room.y + 1;
    for (let y = by; y < by + bh; y++) {
      for (let x = bx; x < bx + bw; x++) {
        if (x < this.width && y < this.height) {
          map[y][x] = TILE_TYPES.BUILDING;
        }
      }
    }
  }

  placeSpellCenter(rooms, map) {
    const room = rooms[Math.floor(this.random() * rooms.length)];
    const x = room.x + 2;
    const y = room.y + 2;
    map[y][x] = TILE_TYPES.SPELL_CENTER;
    return { x, y };
  }

  placeTrainers(rooms, map, areaNum, biome) {
    const trainers = [];
    const count = areaNum === 5 ? 1 : (areaNum === 3 ? 2 : 1);
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

    for (let i = 0; i < count; i++) {
      const room = rooms[this.randomRange(0, rooms.length - 1)];
      const x = room.x + 1;
      const y = room.y + 1;
      if (map[y][x] !== TILE_TYPES.SPELL_CENTER && map[y][x] !== TILE_TYPES.TRAINER) {
        map[y][x] = TILE_TYPES.TRAINER;

        const title = titles[this.randomRange(0, titles.length - 1)];
        const name = names[this.randomRange(0, names.length - 1)];
        const dialog = dialogs[this.randomRange(0, dialogs.length - 1)];

        const area = AREA_CONFIGS[areaNum];
        const species = area.encounters[this.randomRange(0, area.encounters.length - 1)];
        const level = area.maxLevel;
        const party = [{ species, level }];

        trainers.push({
          x, y,
          name: `${title} ${name}`,
          dialog,
          party
        });
      }
    }
    return trainers;
  }

  placeTransitions(map, areaNum) {
    const transitions = [];
    // Left transition (to prev area)
    if (areaNum > 1) {
      const y = Math.floor(this.height / 2);
      for(let i=-1; i<=1; i++) {
        if (y+i >= 0 && y+i < this.height) map[y+i][0] = TILE_TYPES.TRANSITION;
      }
      transitions.push({ x: 0, y, type: TRANSITION_TYPES.PREV });
    }
    // Right transition (to next area)
    if (areaNum < 5) {
      const y = Math.floor(this.height / 2);
      for(let i=-1; i<=1; i++) {
        if (y+i >= 0 && y+i < this.height) map[y+i][this.width - 1] = TILE_TYPES.TRANSITION;
      }
      transitions.push({ x: this.width - 1, y, type: TRANSITION_TYPES.NEXT });
    }
    return transitions;
  }

  connectTransitions(transitions, rooms, map) {
    transitions.forEach(trans => {
      // Find nearest room
      let nearestRoom = rooms[0];
      let minDist = Infinity;
      rooms.forEach(room => {
        const rx = room.x + Math.floor(room.w / 2);
        const ry = room.y + Math.floor(room.h / 2);
        const dist = Math.abs(trans.x - rx) + Math.abs(trans.y - ry);
        if (dist < minDist) {
          minDist = dist;
          nearestRoom = room;
        }
      });

      const rx = nearestRoom.x + Math.floor(nearestRoom.w / 2);
      const ry = nearestRoom.y + Math.floor(nearestRoom.h / 2);
      this.drawCorridor(map, trans.x, trans.y, rx, ry, TILE_TYPES.PATH);
    });
  }

  addFeatures(map, biome) {
    const grassChance = biome === BIOMES.FOREST ? 0.3 : (biome === BIOMES.CAVE ? 0 : 0.1);
    const waterChance = biome === BIOMES.WILDERNESS ? 0.05 : 0.01;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (map[y][x] === TILE_TYPES.WALL) {
          if (this.random() < waterChance) this.floodFill(map, x, y, TILE_TYPES.WATER, 4);
        } else if (map[y][x] === TILE_TYPES.PATH || map[y][x] === TILE_TYPES.EMPTY) {
          if (this.random() < grassChance) map[y][x] = TILE_TYPES.GRASS;
        }
      }
    }
  }

  floodFill(map, x, y, type, size) {
    if (size <= 0 || x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    map[y][x] = type;
    this.floodFill(map, x + 1, y, type, size - 1);
    this.floodFill(map, x, y + 1, type, size - 1);
    if (this.random() > 0.5) this.floodFill(map, x - 1, y, type, size - 1);
  }
}
