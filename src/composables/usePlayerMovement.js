import { ref, onUnmounted } from 'vue';
import { GAME_CONSTANTS } from '../utils/constants';

export function usePlayerMovement(playerX, playerY, handleInput) {
  const movementInterval = ref(null);

  const startMovement = (key) => {
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
