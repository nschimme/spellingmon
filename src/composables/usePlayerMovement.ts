import { ref, onUnmounted, type Ref } from 'vue';
import { GAME_CONSTANTS } from '../utils/constants';

export function usePlayerMovement(playerX: Ref<number>, playerY: Ref<number>, handleInput: (e: { key: string }) => void) {
  const movementInterval = ref<any>(null);

  const startMovement = (key: string) => {
    stopMovement();
    handleInput({ key });
    movementInterval.value = setInterval(() => {
      handleInput({ key });
    }, GAME_CONSTANTS.MOBILE_MOVEMENT_REPEAT_MS);
  };

  const stopMovement = () => {
    if (movementInterval.value) {
      clearInterval(movementInterval.value);
      movementInterval.value = null;
    }
  };

  onUnmounted(stopMovement);

  return {
    startMovement,
    stopMovement
  };
}
