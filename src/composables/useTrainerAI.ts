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
  getTileType: (x: number, y: number) => number
) {
  const alertingTrainer = ref<string | null>(null);

  const checkTrainerLOS = (engagedTrainers: Set<string>) => {
    if (!fsm.matches(GAME_STATES.WORLD) || alertingTrainer.value || !currentMapData.value) return;

    const trainers = currentMapData.value.trainers;
    const LOS_RANGE = 5;

    for (let i = 0; i < trainers.length; i++) {
      const t = trainers[i];
      const trainerId = `area${session.player.currentArea}_${i}`;
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
    session.notify(i18n.global.t('battle.trainerWantsToBattle', { name: trainer.name }));

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
      session.notify(`${trainer.name}: "${trainer.dialog}"`);

      // Extra delay to allow reading the dialog on the map
      setTimeout(() => {
        fsm.send(GAME_EVENTS.CONFIRM, triggerBattleParams);
        engagedTrainers.delete(trainerId);
      }, GAME_CONSTANTS.TRAINER_ENGAGEMENT_DELAY_MS + 500);
    }, 600);
  };

  return {
    alertingTrainer,
    checkTrainerLOS,
    initiateTrainerApproach
  };
}
