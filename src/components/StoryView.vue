<template>
  <div class="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-8 text-white text-center font-bold">
    <div v-if="type === 'intro' || type === 'ending'" class="max-w-2xl w-full">
      <transition name="fade" mode="out-in">
        <div :key="currentIndex" class="min-h-[200px] flex flex-col items-center justify-center">
          <p class="text-xl sm:text-2xl leading-relaxed mb-8">
            {{ currentText }}
          </p>
        </div>
      </transition>

      <div class="mt-8 flex flex-col items-center gap-4">
        <button
          ref="nextButton"
          class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full border-b-4 border-blue-800 transition-all outline-none"
          :class="{ 'ring-4 ring-yellow-400': selectedIndex === 0 }"
          @click="next"
        >
          {{ isLast ? $t('common.continue') : $t('common.continue') }}
        </button>

        <button
          v-if="type === 'intro'"
          class="text-gray-400 hover:text-white text-sm"
          :class="{ 'ring-2 ring-yellow-400': selectedIndex === 1 }"
          @click="skip"
        >
          {{ $t('story.skip') }}
        </button>
      </div>
    </div>

    <div v-else-if="type === 'areaComplete'" class="max-w-xl w-full bg-gray-900 border-4 border-yellow-400 p-8 rounded-2xl shadow-2xl">
      <h2 class="text-3xl text-yellow-400 mb-4 uppercase tracking-widest">
        {{ $t('story.areaComplete.title') }}
      </h2>
      <p class="text-lg mb-8">
        {{ $t('story.areaComplete.description', { area: $t('menu.areaNames.' + area) }) }}
      </p>
      <button
        ref="completeButton"
        class="bg-yellow-400 text-black px-12 py-3 rounded-full font-black uppercase tracking-wider hover:bg-yellow-300 transition-all outline-none"
        :class="{ 'ring-4 ring-white': selectedIndex === 0 }"
        @click="finish"
      >
        {{ $t('common.continue') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';

const props = defineProps<{
  type: 'intro' | 'areaComplete' | 'ending';
  area?: number;
}>();

const emit = defineEmits(['finish']);

const { tm, rt } = useI18n();
const currentIndex = ref(0);

const lines = computed(() => {
  if (props.type === 'intro') return tm('story.intro') as string[];
  if (props.type === 'ending') return tm('story.ending') as string[];
  return [];
});

const currentText = computed(() => {
  if (lines.value.length > 0) {
    return rt(lines.value[currentIndex.value]);
  }
  return '';
});

const isLast = computed(() => currentIndex.value >= lines.value.length - 1);

const next = () => {
  if (isLast.value) {
    emit('finish');
  } else {
    currentIndex.value++;
  }
};

const skip = () => {
  emit('finish');
};

const finish = () => {
  emit('finish');
};

const nextButton = ref<HTMLElement | null>(null);
const completeButton = ref<HTMLElement | null>(null);

const { selectedIndex } = useKeyboardNavigation({
  id: 'story-view',
  isActive: computed(() => true),
  maxIndex: computed(() => props.type === 'intro' ? 2 : 1),
  itemRefs: computed(() => props.type === 'areaComplete' ? [completeButton.value] : [nextButton.value]),
  onConfirm: (idx) => {
    if (props.type === 'intro') {
      if (idx === 0) next();
      else skip();
    } else if (props.type === 'areaComplete') {
      finish();
    } else {
      next();
    }
  }
});

onMounted(() => {
  // Focus logic handled by useKeyboardNavigation selectedIndex
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
