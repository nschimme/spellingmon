<template>
  <div class="w-full h-full flex flex-col items-center justify-center bg-blue-500 p-8">
    <div class="bg-white border-8 border-gray-800 p-8 rounded-3xl shadow-2xl max-w-4xl w-full">
      <h1 class="text-3xl font-black text-center mb-2 uppercase tracking-tighter text-orange-500 drop-shadow-sm">Spellingmon</h1>
      <h2 class="text-sm font-bold text-center mb-10 text-gray-600 uppercase">Choose your partner!</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div v-for="mon in starters" :key="mon.name"
             @click="selectStarter(mon)"
             class="group cursor-pointer bg-white border-4 border-gray-200 hover:border-blue-500 p-4 rounded-2xl transition-all hover:-translate-y-2 hover:shadow-xl flex flex-col items-center">
          <div class="text-6xl mb-4 group-hover:scale-110 transition-transform">{{ mon.icon }}</div>
          <h3 class="text-sm font-black uppercase mb-2">{{ mon.name }}</h3>
          <div :class="typeColor(mon.type)" class="text-[8px] px-2 py-1 rounded-full text-white font-bold mb-2 uppercase">
            {{ mon.type }}
          </div>
          <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-auto">
            <div class="bg-green-400 h-full w-[80%]"></div>
          </div>
          <div class="text-[8px] font-bold mt-1 text-gray-400 uppercase">HP: {{ mon.hp }}</div>
        </div>
      </div>

      <div class="mt-12 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest animate-pulse">
        A new adventure awaits...
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePlayerStore } from '../stores/playerStore';
import { createMon } from '../utils/gameData';

const playerStore = usePlayerStore();

const starters = [
  { name: 'Grammander', type: 'Fire', icon: '🔥', hp: 20 },
  { name: 'Squirtspell', type: 'Water', icon: '💧', hp: 21 },
  { name: 'Bulbaword', type: 'Grass', icon: '🌿', hp: 21 }
];

const selectStarter = (mon) => {
  const fullMon = createMon(mon.name, 5);
  playerStore.setStarter(fullMon);
};

const typeColor = (type) => {
  switch (type) {
    case 'Fire': return 'bg-orange-500';
    case 'Water': return 'bg-blue-500';
    case 'Grass': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};
</script>
