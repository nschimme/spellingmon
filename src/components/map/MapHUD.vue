<template>
  <div class="absolute top-6 left-6 bg-white/95 border-4 border-gray-800 p-4 rounded-xl shadow-xl flex flex-col gap-1">
    <div class="text-sm font-black text-gray-800 uppercase tracking-tighter">
      {{ areaName }}
    </div>
    <div class="text-[8px] font-bold text-gray-500 uppercase">
      Party: {{ leaderName }} (Lv{{ leaderLevel }})
    </div>
  </div>
</template>

<script setup>
defineProps({
  areaName: String,
  leaderName: String,
  leaderLevel: [Number, String]
});
</script>
