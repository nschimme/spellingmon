<template>
  <div class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
    <div class="bg-white border-8 border-gray-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
      <div class="bg-blue-600 p-6 text-center border-b-8 border-gray-800">
        <h2 class="text-3xl font-black text-white uppercase tracking-widest">Experience</h2>
      </div>

      <div class="flex-1 p-8 space-y-6 bg-gray-50 overflow-y-auto">
        <div v-for="mon in results" :key="mon.id" class="bg-white border-4 border-gray-800 p-4 rounded-2xl shadow-md">
          <div class="flex items-center gap-4 mb-3">
            <div class="text-4xl">{{ mon.emoji }}</div>
            <div class="flex-1">
              <div class="flex justify-between items-end">
                <h3 class="font-black text-xl text-gray-800 uppercase">{{ mon.name }}</h3>
                <span class="font-bold text-blue-600">Lv {{ mon.displayLevel }}</span>
              </div>
              <div class="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                EXP Gained: +{{ mon.expGained }}
              </div>
            </div>
          </div>

          <!-- XP Bar -->
          <div class="relative w-full bg-gray-200 h-6 border-4 border-gray-800 rounded-full overflow-hidden shadow-inner">
            <div class="h-full bg-blue-400 transition-all duration-1000 ease-out"
                 :style="{ width: `${mon.displayExpPercent}%` }"></div>
            <div class="absolute inset-0 flex items-center justify-center text-[10px] font-black uppercase text-gray-700">
              {{ Math.round(mon.displayExp) }} / {{ mon.expToNext }}
            </div>
          </div>

          <div v-if="mon.leveledUp" class="mt-2 text-center text-green-600 font-black uppercase text-xs animate-bounce">
            Level Up!
          </div>
        </div>
      </div>

      <div class="p-6 bg-gray-100 border-t-8 border-gray-800 flex justify-center">
        <button @click="$emit('continue')"
                class="bg-green-500 text-white px-12 py-4 rounded-2xl border-b-8 border-green-700 font-black uppercase text-xl tracking-widest hover:bg-green-600 active:translate-y-2 transition-all shadow-xl">
          Continue
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useInputStore } from '../stores/inputStore';
import { audio } from '../utils/audio';
import { SOUND_EFFECTS } from '../utils/constants';

const props = defineProps({
  participatingMons: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['continue']);

const results = ref([]);

const animateExp = async (mon) => {
  if (mon.level === mon.oldLevel) {
    // Normal case: same level
    setTimeout(() => {
      mon.displayExp = mon.exp;
      mon.displayExpPercent = (mon.exp / mon.expToNext) * 100;
    }, 100);
    return;
  }

  // Multi-level case
  // 1. Fill current level to 100%
  mon.displayExpPercent = 100;
  await new Promise(r => setTimeout(r, 1000));

  // 2. Loop through intermediate levels
  let currentLevel = mon.oldLevel + 1;
  while (currentLevel < mon.level) {
    mon.displayExpPercent = 0;
    mon.displayLevel = currentLevel;
    await new Promise(r => setTimeout(r, 50)); // Reset blink
    mon.displayExpPercent = 100;
    await new Promise(r => setTimeout(r, 1000));
    currentLevel++;
  }

  // 3. Final level
  mon.displayExpPercent = 0;
  mon.displayLevel = mon.level;
  await new Promise(r => setTimeout(r, 50));
  mon.displayExp = mon.exp;
  mon.displayExpPercent = (mon.exp / mon.expToNext) * 100;
};

const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    emit('continue');
    return true;
  }
  return false;
};

onUnmounted(() => {
  const inputStore = useInputStore();
  inputStore.removeListener('experience');
});

onMounted(() => {
  const inputStore = useInputStore();
  inputStore.addListener('experience', handleKeyDown, 20);

  // Initialize display data
  results.value = props.participatingMons.map(mon => ({
    ...mon,
    displayExp: mon.oldExp,
    displayExpPercent: (mon.oldExp / (mon.oldLevelExpToNext || mon.expToNext)) * 100,
    displayLevel: mon.oldLevel,
    leveledUp: mon.level > mon.oldLevel
  }));

  // Animate the bars after a short delay
  setTimeout(() => {
    results.value.forEach((mon, index) => {
      setTimeout(() => {
        animateExp(mon);
      }, index * 300);
    });
  }, 500);
});
</script>
