<template>
  <transition name="battle-transition">
    <div
      v-if="active"
      class="absolute inset-0 z-[100] pointer-events-none overflow-hidden transition-all duration-1000"
    >
      <!-- Flashing Bars -->
      <div class="absolute inset-0 flex flex-col">
        <div
          v-for="i in 8"
          :key="i"
          class="flex-1 bg-black animate-slide-in"
          :style="{ animationDelay: `${i * 0.05}s` }"
        />
      </div>

      <!-- Center Swirl Zoom -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-[200vmax] h-[200vmax] bg-white rounded-full animate-swirl-out" />
      </div>

      <!-- Flash Overlay -->
      <div class="absolute inset-0 bg-white animate-flash-quick" />
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  active: boolean;
}>();
</script>

<style scoped>
@keyframes slide-in {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(0); }
}

@keyframes swirl-out {
  0% { transform: scale(0) rotate(0deg); opacity: 0; }
  50% { transform: scale(0.8) rotate(360deg); opacity: 0.5; }
  100% { transform: scale(2) rotate(1080deg); opacity: 1; }
}

@keyframes flash-quick {
  0%, 100% { opacity: 0; }
  10%, 30%, 50% { opacity: 0.8; }
  20%, 40% { opacity: 0; }
}

.animate-slide-in {
  animation: slide-in 0.4s ease-out forwards;
}

.animate-swirl-out {
  animation: swirl-out 1.2s cubic-bezier(0.7, 0, 0.3, 1) forwards;
}

.animate-flash-quick {
  animation: flash-quick 0.8s ease-in-out forwards;
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
