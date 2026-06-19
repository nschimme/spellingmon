<template>
  <div class="w-full h-full flex flex-col items-center justify-center bg-sky-600 p-4 md:p-8">
    <div class="bg-white border-8 border-gray-800 p-6 md:p-12 rounded-[3rem] shadow-2xl max-w-4xl w-full overflow-y-auto max-h-full transform rotate-1">
      <h1 class="text-3xl md:text-5xl font-black text-center mb-4 uppercase tracking-tighter text-blue-600 drop-shadow-sm">
        {{ $t('starter.title') }}
      </h1>
      <p class="text-xs md:text-sm font-bold text-center mb-8 md:mb-12 text-gray-500 uppercase tracking-[0.2em]">
        {{ $t('starter.description') }}
      </p>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div
          v-for="(mon, i) in starters"
          :key="mon.species"
          :class="{ 'ring-8 ring-yellow-400 border-blue-500 -translate-y-4 shadow-2xl bg-blue-50': selectedIndex === i }"
          class="group cursor-pointer bg-gray-50 border-8 border-gray-800 p-8 rounded-[2rem] transition-all duration-300 flex flex-col items-center relative overflow-hidden"
          @click="selectStarter(mon)"
        >
          <!-- Background Glow -->
          <div
            class="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
            :class="typeBgColor(mon.type)"
          />

          <div
            class="text-8xl mb-6 group-hover:scale-125 transition-transform duration-500 drop-shadow-xl"
            :class="{ 'scale-125': selectedIndex === i }"
          >
            {{ mon.icon }}
          </div>

          <h3 class="text-xl font-black uppercase mb-3 text-gray-800">
            {{ $t('monsters.' + mon.species) }}
          </h3>

          <div
            :class="typeColor(mon.type)"
            class="text-[10px] px-4 py-1.5 rounded-full text-white font-black mb-6 uppercase tracking-widest border-b-4 border-black/20"
          >
            {{ $t('types.' + mon.type) }}
          </div>

          <div class="w-full space-y-2 mt-auto">
             <div class="flex justify-between items-center text-[10px] font-black uppercase text-gray-400">
                <span>{{ $t('starter.hp') }}</span>
                <span>{{ mon.hp }}</span>
             </div>
             <div class="w-full bg-gray-200 h-4 rounded-full overflow-hidden border-2 border-gray-800">
                <div class="bg-green-500 h-full w-full" />
             </div>
          </div>
        </div>
      </div>

      <div class="mt-12 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest animate-pulse">
        {{ $t('starter.adventureAwaits') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSessionStore } from '../stores/sessionStore';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';
import { createMon, SPECIES } from '../utils/gameData';
import { INPUT_PRIORITIES } from '../utils/constants';

const session = useSessionStore();
const emit = defineEmits(['complete']);

const starters = [
  { species: SPECIES.Grammander, type: 'Fire', icon: '🔥', hp: 20 },
  { species: SPECIES.Squirtspell, type: 'Water', icon: '💧', hp: 21 },
  { species: SPECIES.Bulbaword, type: 'Grass', icon: '🌿', hp: 21 }
];

const selectStarter = (mon: any) => {
  const fullMon = createMon(mon.species, 1);
  session.setStarter(fullMon);
  emit('complete');
};

const { selectedIndex } = useKeyboardNavigation({
  id: 'starter-selection',
  priority: INPUT_PRIORITIES.GLOBAL,
  maxIndex: 3,
  gridColumns: 3,
  onConfirm: (idx) => selectStarter(starters[idx])
});

const typeColor = (type: string) => {
  switch (type) {
    case 'Fire': return 'bg-red-500';
    case 'Water': return 'bg-blue-500';
    case 'Grass': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const typeBgColor = (type: string) => {
  switch (type) {
    case 'Fire': return 'bg-red-500';
    case 'Water': return 'bg-blue-500';
    case 'Grass': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};
</script>
