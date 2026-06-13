import { ref } from 'vue';
import { audio } from '../utils/audio';
import { SOUND_EFFECTS, GAME_CONSTANTS } from '../utils/constants';
import { TILE_TYPES } from '../utils/mapGenerator';

export function useTrainerAI(playerStore, battleStore, currentMapData, playerX, playerY, getTileType) {
  const alertingTrainer = ref(null);

  const checkTrainerLOS = (engagedTrainers) => {
    if (battleStore.inBattle || alertingTrainer.value || !currentMapData.value) return;

    const trainers = currentMapData.value.trainers;
    const LOS_RANGE = 5;

    for (let i = 0; i < trainers.length; i++) {
      const t = trainers[i];
      const trainerId = `area${playerStore.currentArea}_${i}`;
      if (playerStore.defeatedTrainers.includes(trainerId)) continue;
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

  const initiateTrainerApproach = (trainer, trainerId, engagedTrainers, triggerTrainerBattle) => {
    engagedTrainers.add(trainerId);
    alertingTrainer.value = trainerId;
    audio.playSound(SOUND_EFFECTS.CLICK);

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

        currentMapData.value.map[oldY][oldX] = TILE_TYPES.PATH;
        currentMapData.value.map[trainer.y][trainer.x] = TILE_TYPES.TRAINER;

        await new Promise(r => setTimeout(r, 150));
      }

      alertingTrainer.value = null;
      playerStore.notify(`${trainer.name}: "${trainer.dialog}"`);

      setTimeout(() => {
        triggerTrainerBattle(trainer, trainerId);
        engagedTrainers.delete(trainerId);
      }, GAME_CONSTANTS.TRAINER_ENGAGEMENT_DELAY_MS);
    }, 600);
  };

  return {
    alertingTrainer,
    checkTrainerLOS,
    initiateTrainerApproach
  };
}
