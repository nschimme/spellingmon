<template>
  <div
    class="absolute w-10 h-10 border border-black/5 flex items-center justify-center text-lg transition-all duration-300"
    :class="getTileClass(type)"
    :style="{ left: `${x * 40}px`, top: `${y * 40}px` }"
  >
    <span
      v-if="isAlerting"
      class="absolute -top-6 text-red-600 font-bold animate-bounce text-2xl"
    >!</span>
    {{ emoji }}
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { TILE_TYPES } from '../../utils/mapGenerator';
import { TRANSITION_TYPES } from '../../utils/constants';

const props = defineProps({
  x: Number,
  y: Number,
  type: Number,
  isAlerting: Boolean,
  trainerEmoji: String,
  transitions: {
    type: Array,
    default: () => []
  }
});

const getTileClass = (type) => {
  switch (type) {
    case TILE_TYPES.SPELL_CENTER: return 'bg-red-50 border-red-300';
    case TILE_TYPES.GRASS: return 'bg-green-300';
    case TILE_TYPES.TRANSITION: return 'bg-yellow-100';
    case TILE_TYPES.WATER: return 'bg-blue-300';
    case TILE_TYPES.WALL: return 'bg-gray-800';
    case TILE_TYPES.CAVE_WALL: return 'bg-amber-900';
    case TILE_TYPES.BUILDING: return 'bg-blue-800';
    case TILE_TYPES.PATH: return 'bg-orange-50';
    case TILE_TYPES.EMPTY: return 'bg-gray-100';
    default: return 'bg-green-100';
  }
};

const emoji = computed(() => {
  if (props.type === TILE_TYPES.TRAINER) return props.trainerEmoji || '👤';

  switch (props.type) {
    case TILE_TYPES.GRASS: return '🌲';
    case TILE_TYPES.SPELL_CENTER: return '🏥';
    case TILE_TYPES.TRANSITION: {
      const transition = props.transitions.find(t => t.x === props.x && t.y === props.y);
      return transition?.type === TRANSITION_TYPES.NEXT ? '🔼' : '🔽';
    }
    case TILE_TYPES.WATER: return '💧';
    case TILE_TYPES.BUILDING: return '🏠';
    default: return '';
  }
});
</script>
