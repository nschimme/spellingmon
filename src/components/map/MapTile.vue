<template>
  <div
    class="absolute w-10 h-10 border border-black/5 flex items-center justify-center text-lg transition-all duration-300"
    :class="getTileClass(type)"
    :style="{ left: `${x * 40}px`, top: `${y * 40}px` }"
  >
    {{ emoji }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TILE_TYPES } from '../../utils/mapGenerator';
import { TRANSITION_TYPES } from '../../utils/constants';

const props = defineProps({
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  type: { type: Number, default: 0 },
  transitions: {
    type: Array,
    default: () => []
  }
});

const getTileClass = (type: any) => {
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
    case TILE_TYPES.TRAINER: return 'bg-orange-50'; // Render trainers on path color
    default: return 'bg-green-100';
  }
};

const emoji = computed(() => {
  switch (props.type) {
    case TILE_TYPES.GRASS: return '🌿';
    case TILE_TYPES.SPELL_CENTER: return '🏥';
    case TILE_TYPES.TRANSITION: {
      const transition = (props.transitions as any[]).find(t => t.x === props.x && t.y === props.y);
      return transition?.type === TRANSITION_TYPES.NEXT ? '🔼' : '🔽';
    }
    case TILE_TYPES.WATER: return '💧';
    case TILE_TYPES.BUILDING: return '🏠';
    default: return '';
  }
});
</script>
