<template>
  <div class="w-full h-full flex flex-col items-center justify-center bg-blue-500 p-4 md:p-8">
    <div class="bg-white border-8 border-gray-800 p-6 md:p-8 rounded-3xl shadow-2xl max-w-4xl w-full overflow-y-auto max-h-full">
      <h1 class="text-2xl md:text-3xl font-black text-center mb-2 uppercase tracking-tighter text-orange-500 drop-shadow-sm">
        {{ $t('landing.title') }}
      </h1>
      <h2 class="text-xs md:text-sm font-bold text-center mb-6 md:mb-10 text-gray-600 uppercase">
        {{ $t('starter.title') }}
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div
          v-for="(mon, i) in starters"
          :key="mon.species"
          :class="{ 'ring-8 ring-yellow-400 border-yellow-400 -translate-y-2 shadow-xl': selectedIndex === i }"
          class="group cursor-pointer bg-white border-4 border-gray-200 hover:border-blue-500 p-4 rounded-2xl transition-all hover:-translate-y-2 hover:shadow-xl flex flex-col items-center"
          @click="selectStarter(mon)"
        >
          <div
            class="text-6xl mb-4 group-hover:scale-110 transition-transform"
            :class="{ 'scale-110': selectedIndex === i }"
          >
            {{ mon.icon }}
          </div>
          <h3 class="text-sm font-black uppercase mb-2">
            {{ $t('monsters.' + mon.species) }}
          </h3>
          <div
            :class="typeColor(mon.type)"
            class="text-[8px] px-2 py-1 rounded-full text-white font-bold mb-2 uppercase"
          >
            {{ $t('types.' + mon.type) }}
          </div>
          <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-auto">
            <div class="bg-green-400 h-full w-[80%]" />
          </div>
          <div class="text-[8px] font-bold mt-1 text-gray-400 uppercase">
            {{ $t('starter.hp') }}: {{ mon.hp }}
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
    case 'Fire': return 'bg-orange-500';
    case 'Water': return 'bg-blue-500';
    case 'Grass': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};
</script>
