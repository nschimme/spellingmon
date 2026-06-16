<template>
  <div class="flex flex-col gap-6 max-w-xl mx-auto">
    <div class="flex justify-end items-center px-2">
      <div class="bg-gray-800 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
        {{ $t('menu.monCount', { n: playerStore.party.length }) }}
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <div
        v-for="(mon, i) in playerStore.party"
        :key="mon.id"
        :ref="el => { if (el) itemRefs[i] = el }"
        :class="[
          selectedIndex === i ? 'ring-8 ring-yellow-400 border-blue-500 bg-blue-50 -translate-y-1 shadow-lg' : 'bg-white border-gray-800 shadow-md',
          i === 0 ? 'border-l-[12px] border-l-yellow-400' : 'border-4'
        ]"
        class="border-4 p-4 rounded-3xl flex flex-col gap-3 transition-all duration-200 relative overflow-hidden"
      >
        <!-- Background Decoration -->
        <div class="absolute -right-4 -bottom-4 text-8xl opacity-5 pointer-events-none grayscale">
          {{ mon.emoji }}
        </div>

        <div class="flex items-center gap-5 relative z-10">
          <div class="bg-white p-3 rounded-2xl border-4 border-gray-800 shadow-inner group">
            <div class="text-5xl group-hover:scale-110 transition-transform duration-300">
              {{ mon.emoji }}
            </div>
            <div class="absolute -top-2 -right-2 bg-white border-2 border-gray-800 rounded-lg p-1 text-sm shadow-sm">
              {{ TYPE_EMOJIS[MONS[mon.species]?.type] }}
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-end mb-1">
              <h3 class="text-xl font-black uppercase text-gray-800 truncate">
                {{ $t('monsters.' + mon.species) }}
              </h3>
              <span class="text-sm font-black text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md border-2 border-blue-200">LV{{ mon.level }}</span>
            </div>

            <!-- HP Bar -->
            <div class="space-y-1">
              <div class="flex justify-between text-[10px] font-black uppercase text-gray-500">
                <span>{{ $t('menu.hp') }}</span>
                <span>{{ mon.hp }} / {{ mon.maxHp }}</span>
              </div>
              <div class="w-full bg-gray-200 h-4 border-2 border-gray-800 rounded-full overflow-hidden shadow-inner">
                <div
                  :class="getHPColorClass(mon.hp, mon.maxHp)"
                  class="h-full transition-all duration-500 ease-out border-r-2 border-black/10"
                  :style="{ width: `${(mon.hp / mon.maxHp) * 100}%` }"
                />
              </div>
            </div>

            <!-- EXP Bar -->
            <div class="mt-2 space-y-1">
              <div class="flex justify-between text-[8px] font-black uppercase text-blue-400">
                <span>{{ $t('menu.exp') }}</span>
                <span>{{ mon.exp }} / {{ mon.expToNext }}</span>
              </div>
              <div class="w-full bg-blue-50 h-1.5 border border-blue-200 rounded-full overflow-hidden">
                <div
                  class="bg-blue-400 h-full transition-all duration-700"
                  :style="{ width: `${(mon.exp / mon.expToNext) * 100}%` }"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center mt-2 relative z-10">
          <div class="flex gap-4">
            <div class="flex flex-col">
              <span class="text-[8px] font-bold text-gray-400 uppercase leading-none">{{ $t('menu.atk') }}</span>
              <span class="text-sm font-black text-gray-700">{{ mon.atk }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[8px] font-bold text-gray-400 uppercase leading-none">{{ $t('menu.def') }}</span>
              <span class="text-sm font-black text-gray-700">{{ mon.def }}</span>
            </div>
            <div class="flex flex-col">
              <span class="text-[8px] font-bold text-gray-400 uppercase leading-none">{{ $t('menu.spd') }}</span>
              <span class="text-sm font-black text-gray-700">{{ mon.spd }}</span>
            </div>
          </div>

          <div
            v-if="i > 0"
            class="flex items-center gap-2"
          >
            <span
              v-if="selectedIndex === i"
              class="text-[10px] font-bold text-blue-500 uppercase animate-pulse"
            >{{ $t('menu.pressEnterToSwap') }}</span>
            <button
              class="bg-blue-500 hover:bg-blue-600 text-white text-[10px] px-4 py-2 rounded-xl font-black uppercase border-b-4 border-blue-700 active:translate-y-1 transition-all"
              @click="playerStore.moveMonToFront(i)"
            >
              {{ $t('menu.setLeader') }}
            </button>
          </div>
          <div
            v-else
            class="flex items-center gap-2"
          >
            <div class="bg-yellow-400 text-gray-900 text-[10px] px-3 py-1 rounded-full font-black uppercase border-2 border-gray-800 shadow-sm">
              ★ {{ $t('menu.activeLeader') }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { usePlayerStore } from '../../stores/playerStore';
import { useKeyboardNavigation } from '../../composables/useKeyboardNavigation';
import { INPUT_PRIORITIES } from '../../utils/constants';
import { TYPE_EMOJIS, MONS } from '../../utils/gameData';
import { getHPColorClass } from '../../utils/visuals';

const playerStore = usePlayerStore();

const emit = defineEmits(['back']);
const itemRefs = ref([]);

const { selectedIndex } = useKeyboardNavigation({
  id: 'menu-party',
  priority: INPUT_PRIORITIES.MENU + 10,
  maxIndex: computed(() => playerStore.party.length),
  onConfirm: (idx) => {
    if (idx > 0) {
      playerStore.moveMonToFront(idx);
    }
  },
  onCancel: () => emit('back')
});

watch(selectedIndex, (newIdx) => {
  if (itemRefs.value[newIdx]) {
    itemRefs.value[newIdx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
});
</script>
