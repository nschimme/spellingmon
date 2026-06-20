<template>
  <transition name="battle-transition">
    <div
      v-if="active"
      class="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
    >
      <!-- Flash -->
      <div class="absolute inset-0 bg-white animate-flash-rapid" />

      <!-- Swirl / SVG Overlay -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-[200vmax] h-[200vmax] bg-black rounded-full animate-swirl-zoom" />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  active: boolean;
}>();
</script>

<style scoped>
@keyframes flash-rapid {
  0%, 20%, 40%, 60%, 80%, 100% { opacity: 0; }
  10%, 30%, 50%, 70%, 90% { opacity: 1; }
}

@keyframes swirl-zoom {
  0% { transform: scale(0) rotate(0deg); opacity: 0; }
  50% { transform: scale(0.5) rotate(180deg); opacity: 1; }
  100% { transform: scale(1.5) rotate(720deg); opacity: 1; }
}

.animate-flash-rapid {
  animation: flash-rapid 0.8s steps(1) forwards;
}

.animate-swirl-zoom {
  animation: swirl-zoom 1.2s ease-in-out forwards;
}

.battle-transition-enter-active,
.battle-transition-leave-active {
  transition: opacity 0.5s;
}

.battle-transition-enter-from,
.battle-transition-leave-to {
  opacity: 0;
}
</style>
