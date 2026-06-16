<template>
  <div class="absolute top-6 left-6 bg-white/95 border-4 border-gray-800 p-4 rounded-xl shadow-xl flex flex-col gap-1">
    <div class="flex items-baseline gap-2">
      <div class="text-sm font-black text-gray-800 uppercase tracking-tighter">
        {{ areaName }}
      </div>
      <div
        v-if="biome"
        class="text-[10px] font-bold text-blue-600 uppercase italic opacity-75"
      >
        {{ $t('menu.biomes.' + biome) }}
      </div>
    </div>
    <div class="text-[8px] font-bold text-gray-500 uppercase">
      {{ $t('menu.party') }}: {{ leaderName }} (Lv{{ leaderLevel }})
    </div>
  </div>
</template>

<script setup>
defineProps({
  areaName: { type: String, default: '' },
  biome: { type: String, default: '' },
  leaderName: { type: String, default: '' },
  leaderLevel: { type: [Number, String], default: 1 }
});
</script>
