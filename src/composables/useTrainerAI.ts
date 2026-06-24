import { ref, type Ref } from 'vue';
import i18n from '../i18n';
import { audio } from '../utils/audio';
import { SOUND_EFFECTS, BATTLE_TYPES, GAME_CONSTANTS, GAME_STATES, GAME_EVENTS } from '../utils/constants';
import { TILE_TYPES, type MapResult, type Trainer } from '../utils/mapGenerator';

export function useTrainerAI(
  session: any,
  fsm: any,
  currentMapData: Ref<MapResult | null>,
  playerX: Ref<number>,
  playerY: Ref<number>,
  getTileType: (x: number, y: number) => number,
  getTrainerId: (trainer: any) => string
) {
  const alertingTrainer = ref<string | null>(null);

  const checkTrainerLOS = (engagedTrainers: Set<string>) => {
    const isWorld = fsm.matches(GAME_STATES.WORLD) || fsm.matches(GAME_STATES.MOVING);
    if (!isWorld || alertingTrainer.value || !currentMapData.value || session.player.currentInterior) return;

    const trainers = currentMapData.value.trainers;
    const LOS_RANGE = 5;

    for (let i = 0; i < trainers.length; i++) {
      const t = trainers[i];
      const trainerId = getTrainerId(t);
      if (session.player.defeatedTrainers.includes(trainerId)) continue;
      if (engagedTrainers.has(trainerId)) continue;

      let inLOS = false;
      const dx = playerX.value - t.x;
      const dy = playerY.value - t.y;

      if (t.direction === 'right' && dy === 0 && dx > 0 && dx <= LOS_RANGE) inLOS = true;
      else if (t.direction === 'left' && dy === 0 && dx < 0 && dx >= -LOS_RANGE) inLOS = true;
      else if (t.direction === 'down' && dx === 0 && dy > 0 && dy <= LOS_RANGE) inLOS = true;
      else if (t.direction === 'up' && dx === 0 && dy < 0 && dy >= -LOS_RANGE) inLOS = true;

      if (inLOS) {
        let hasObstacle = false;
        const stepX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
        const stepY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
        const dist = Math.max(Math.abs(dx), Math.abs(dy));

        for (let s = 1; s < dist; s++) {
          const checkX = t.x + stepX * s;
          const checkY = t.y + stepY * s;
          const tile = getTileType(checkX, checkY);
          if (tile === TILE_TYPES.WALL || tile === TILE_TYPES.WATER || tile === TILE_TYPES.CAVE_WALL || tile === TILE_TYPES.BUILDING) {
            hasObstacle = true;
            break;
          }
        }

        if (hasObstacle) continue;
        return { trainer: t, trainerId };
      }
    }
    return null;
  };

  const initiateTrainerApproach = (trainer: Trainer, trainerId: string, engagedTrainers: Set<string>, triggerBattleParams: any) => {
    engagedTrainers.add(trainerId);
    alertingTrainer.value = trainerId;
    audio.playSound(SOUND_EFFECTS.CLICK);

    // Block movement immediately
    fsm.send(GAME_EVENTS.ENCOUNTER, { type: BATTLE_TYPES.TRAINER });

    // Initial speech notification using i18n
    let displayName = trainer.name;
    if (displayName.includes('::')) {
      const [key, raw] = displayName.split('::');
      displayName = `${i18n.global.t(key)} ${raw}`;
    } else {
      displayName = i18n.global.t(displayName);
    }
    const dialog = i18n.global.t(trainer.dialog);
    session.notify(i18n.global.t('battle.trainerWantsToBattle', { name: displayName }));

    setTimeout(async () => {
      const dx = playerX.value - trainer.x;
      const dy = playerY.value - trainer.y;
      const stepX = dx === 0 ? 0 : (dx > 0 ? 1 : -1);
      const stepY = dy === 0 ? 0 : (dy > 0 ? 1 : -1);
      const dist = Math.max(Math.abs(dx), Math.abs(dy)) - 1;

      for (let s = 0; s < dist; s++) {
        const oldX = trainer.x;
        const oldY = trainer.y;
        trainer.x += stepX;
        trainer.y += stepY;

        if (currentMapData.value) {
          currentMapData.value.map[oldY][oldX] = TILE_TYPES.PATH;
          currentMapData.value.map[trainer.y][trainer.x] = TILE_TYPES.TRAINER;
        }

        await new Promise(r => setTimeout(r, 200));
      }

      alertingTrainer.value = null;
      // Show trainer dialog on the map before battle
      session.notify(`${displayName}: "${dialog}"`);

      // Extra delay to allow reading the dialog on the map
      setTimeout(() => {
        fsm.send(GAME_EVENTS.CONFIRM, triggerBattleParams);
        engagedTrainers.delete(trainerId);
      }, GAME_CONSTANTS.TRAINER_ENGAGEMENT_DELAY_MS + GAME_CONSTANTS.TRAINER_DIALOG_DELAY_MS);
    }, 600);
  };

  const findFleePath = (startX: number, startY: number) => {
    if (!currentMapData.value) return [];
    const map = currentMapData.value.map;
    const w = map[0].length;
    const h = map.length;
    const walkable = [TILE_TYPES.PATH, TILE_TYPES.EMPTY, TILE_TYPES.GRASS, TILE_TYPES.SPELL_CENTER, TILE_TYPES.TRAINER, TILE_TYPES.TRANSITION, TILE_TYPES.CARPET];

    const queue: [number, number, { x: number, y: number, dir: string }[]][] = [[startX, startY, []]];
    const visited = new Set([`${startX},${startY}`]);

    while (queue.length > 0) {
      const [x, y, path] = queue.shift()!;

      // Goal: Reach any edge or a distance of 15 from start
      const dist = Math.abs(x - startX) + Math.abs(y - startY);
      if (x <= 0 || x >= w - 1 || y <= 0 || y >= h - 1 || dist >= 15) {
        return path;
      }

      const neighbors: [number, number, string][] = [
        [x + 1, y, 'right'],
        [x - 1, y, 'left'],
        [x, y + 1, 'down'],
        [x, y - 1, 'up']
      ];
      for (const [nx, ny, dir] of neighbors) {
        const key = `${nx},${ny}`;
        if (nx >= 0 && nx < w && ny >= 0 && ny < h && walkable.includes(map[ny][nx]) && !visited.has(key)) {
          visited.add(key);
          queue.push([nx, ny, [...path, { x: nx, y: ny, dir }]]);
        }
      }
    }
    return [];
  };

  const startTrainerFleeing = async (trainer: any, trainerId: string, fleeingList: Ref<any[]>) => {
    // 1. Remove from map tile occupancy so player can walk there immediately
    if (currentMapData.value) {
       currentMapData.value.map[trainer.y][trainer.x] = TILE_TYPES.PATH;
    }

    // 2. Add to fleeing list for independent rendering
    const fleeingTrainer = {
      ...trainer,
      trainerId,
      opacity: 1
    };
    fleeingList.value.push(fleeingTrainer);

    // 3. Follow path
    const path = findFleePath(trainer.x, trainer.y);
    if (path.length === 0) {
      // Fallback: just fade out
      fleeingTrainer.opacity = 0;
    } else {
      for (const step of path) {
        fleeingTrainer.x = step.x;
        fleeingTrainer.y = step.y;
        fleeingTrainer.direction = step.dir;
        await new Promise(r => setTimeout(r, 200));
      }
      fleeingTrainer.opacity = 0;
    }

    // 4. Cleanup
    setTimeout(() => {
      const idx = fleeingList.value.indexOf(fleeingTrainer);
      if (idx !== -1) fleeingList.value.splice(idx, 1);
    }, 1000);
  };

  return {
    alertingTrainer,
    checkTrainerLOS,
    initiateTrainerApproach,
    startTrainerFleeing
  };
}
