<template>
  <div class="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-8 relative overflow-hidden">
    <!-- Animated Background Elements -->
    <div class="absolute top-10 left-10 text-6xl opacity-20 animate-bounce">🔥</div>
    <div class="absolute bottom-20 right-20 text-6xl opacity-20 animate-pulse">💧</div>
    <div class="absolute top-1/2 left-20 text-6xl opacity-20 animate-bounce delay-700">🌿</div>

    <div class="z-10 flex flex-col items-center">
      <div class="bg-white border-8 border-gray-800 p-12 rounded-[3rem] shadow-2xl transform -rotate-2 hover:rotate-0 transition-transform duration-500">
        <h1 class="text-6xl font-black text-center mb-4 uppercase tracking-tighter text-orange-500 drop-shadow-[4px_4px_0_rgba(0,0,0,1)]">
          SPELLINGMON
        </h1>
        <p class="text-gray-600 font-bold text-center mb-12 uppercase tracking-widest text-sm">
          Gotta Spell 'Em All!
        </p>

        <button @click="$emit('start')"
                class="w-full bg-blue-500 hover:bg-blue-600 text-white font-black py-6 px-12 rounded-2xl border-b-8 border-blue-800 text-2xl uppercase tracking-widest transition-all active:border-b-0 active:translate-y-2 group">
          <span class="group-hover:scale-110 inline-block transition-transform">Start Game</span>
        </button>
      </div>

      <p class="mt-12 text-white/50 font-bold uppercase text-xs tracking-widest animate-pulse">
        Press any key or click to begin
      </p>
    </div>
  </div>
</template>

<script setup>
defineEmits(['start']);
</script>
