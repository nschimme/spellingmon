<template>
  <div class="w-full h-full flex flex-col items-center justify-center bg-blue-500 p-8 text-white relative overflow-hidden">
    <!-- Background patterns -->
    <div class="absolute inset-0 opacity-10">
      <div class="grid grid-cols-6 gap-8 p-8">
        <div
          v-for="n in 24"
          :key="n"
          class="text-4xl transform rotate-12"
        >
          {{ emojis[n % emojis.length] }}
        </div>
      </div>
    </div>

    <div class="z-10 flex flex-col items-center max-w-md w-full">
      <!-- Animated Monster -->
      <div class="text-8xl mb-8 animate-bounce-custom">
        {{ currentEmoji }}
      </div>

      <!-- Loading Text -->
      <div class="bg-white border-8 border-gray-800 p-6 rounded-[2rem] shadow-2xl w-full text-gray-800 text-center">
        <h2 class="text-2xl font-black uppercase mb-4 tracking-tight animate-pulse">
          {{ $t('common.loading') }}...
        </h2>

        <div class="h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-gray-800 mb-6">
          <div
            class="h-full bg-blue-500 transition-all duration-500"
            :style="{ width: progress + '%' }"
          />
        </div>

        <div class="space-y-2">
          <p class="text-[10px] font-black uppercase text-blue-600 tracking-widest">
            {{ $t('loading.didYouKnow') }}
          </p>
          <p class="text-xs font-bold text-gray-600 leading-relaxed italic">
            "{{ currentTip }}"
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const emojis = ['🔥', '💧', '🌿', '⚡️', '❄️', '👊', '☣️', '⛰️', '🦅', '🧠', '🐛', '🌑'];
const currentEmoji = ref(emojis[0]);
const progress = ref(0);

const tips = computed(() => [
  t('loading.tip1'),
  t('loading.tip2'),
  t('loading.tip3'),
  t('loading.tip4'),
  t('loading.tip5'),
]);
const currentTip = ref(tips.value[Math.floor(Math.random() * tips.value.length)]);

let emojiInterval: any;
let progressInterval: any;

onMounted(() => {
  emojiInterval = setInterval(() => {
    currentEmoji.value = emojis[Math.floor(Math.random() * emojis.length)];
  }, 500);

  progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 10;
    }
  }, 200);
});

onUnmounted(() => {
  clearInterval(emojiInterval);
  clearInterval(progressInterval);
});
</script>

<style scoped>
.animate-bounce-custom {
  animation: bounce-custom 1s infinite;
}

@keyframes bounce-custom {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.1); }
}
</style>
