<template>
  <transition name="battle-transition">
    <div
      v-if="active"
      class="fixed inset-0 z-[100] pointer-events-none overflow-hidden backdrop-blur-md transition-all duration-1000"
    >
      <!-- Smooth Fade Overlay -->
      <div class="absolute inset-0 bg-white/30 animate-fade-in-out" />

      <!-- Swirl / SVG Overlay -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-[200vmax] h-[200vmax] bg-black/80 rounded-full animate-swirl-zoom" />
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
@keyframes fade-in-out {
  0% { opacity: 0; backdrop-filter: blur(0px); }
  50% { opacity: 1; backdrop-filter: blur(20px); }
  100% { opacity: 0; backdrop-filter: blur(0px); }
}

@keyframes swirl-zoom {
  0% { transform: scale(0) rotate(0deg); opacity: 0; }
  50% { transform: scale(0.5) rotate(180deg); opacity: 0.8; }
  100% { transform: scale(1.5) rotate(720deg); opacity: 1; }
}

.animate-fade-in-out {
  animation: fade-in-out 1.2s ease-in-out forwards;
}

.animate-swirl-zoom {
  animation: swirl-zoom 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
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
