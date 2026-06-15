<template>
  <div class="fixed inset-0 bg-gray-900 z-50 flex flex-col">
    <div class="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full bg-white sm:border-x-8 sm:border-gray-800 shadow-2xl relative">
      <!-- Main Menu List -->
      <div
        v-if="!activeDetailTab"
        class="flex-1 flex flex-col p-6 bg-gray-50 overflow-y-auto"
      >
        <div class="mb-8">
          <h1 class="text-4xl font-black uppercase text-gray-800 tracking-tighter">
            {{ $t('menu.title') }}
          </h1>
          <div class="h-2 w-20 bg-blue-500 mt-2" />
        </div>

        <nav class="flex flex-col gap-3">
          <button
            v-for="(item, i) in menuItems"
            :key="item.id"
            :ref="el => { if (el) itemRefs[i] = el }"
            class="group flex items-center justify-between p-4 rounded-2xl transition-all duration-200 font-black uppercase tracking-widest text-left"
            :class="[
              selectedIndex === i ? 'bg-blue-600 text-white translate-x-2 ring-8 ring-yellow-400' : 'bg-white text-gray-700 hover:bg-gray-100 border-4 border-gray-800',
              item.class
            ]"
            @click="handleMenuClick(item)"
          >
            <div class="flex items-center gap-4">
              <span class="text-2xl group-hover:scale-125 transition-transform">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </div>
            <span
              v-if="selectedIndex === i"
              class="text-xl"
            >▶</span>
          </button>
        </nav>
      </div>

      <!-- Detail View -->
      <div
        v-else
        class="flex-1 flex flex-col overflow-hidden bg-gray-50"
      >
        <!-- Detail Header -->
        <div class="bg-gray-800 text-white p-4 flex items-center gap-4 shadow-lg shrink-0">
          <button
            class="bg-gray-700 hover:bg-gray-600 w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 border-gray-600 ring-yellow-400 focus:ring-8"
            @click="activeDetailTab = null"
          >
            ◀
          </button>
          <div class="flex flex-col">
            <span class="text-[10px] uppercase font-bold text-gray-400 leading-none">Menu</span>
            <h2 class="text-xl font-black uppercase tracking-tight leading-none">
              {{ activeItemLabel }}
            </h2>
          </div>
        </div>

        <!-- Detail Content -->
        <div class="flex-1 overflow-y-auto p-6 scroll-smooth">
          <component
            :is="activeComponent"
            @back="activeDetailTab = null"
          />
        </div>

        <!-- Detail Footer Hint -->
        <div class="p-2 bg-gray-200 text-[10px] font-bold text-gray-500 uppercase text-center border-t border-gray-300">
          {{ $t('menu.pressEsc') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { usePlayerStore } from '../stores/playerStore';
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation';
import { MENU_TABS, INPUT_PRIORITIES } from '../utils/constants';
import { useI18n } from 'vue-i18n';

// Sub-components
import MenuParty from './menu/MenuParty.vue';
import MenuSpellingdex from './menu/MenuSpellingdex.vue';
import MenuMap from './menu/MenuMap.vue';
import MenuProgress from './menu/MenuProgress.vue';
import MenuSettings from './menu/MenuSettings.vue';

const playerStore = usePlayerStore();
const emit = defineEmits(['close']);
const { t } = useI18n();

const activeDetailTab = ref(null);
const itemRefs = ref([]);

const menuItems = computed(() => [
  { id: MENU_TABS.PARTY, label: t('menu.party'), icon: '🎒', component: MenuParty },
  { id: MENU_TABS.SPELLINGDEX, label: t('menu.spellingdex'), icon: '📖', component: MenuSpellingdex },
  { id: MENU_TABS.MAP, label: t('menu.map'), icon: '🗺️', component: MenuMap },
  { id: MENU_TABS.PROGRESS, label: t('menu.progress'), icon: '🏆', component: MenuProgress },
  { id: MENU_TABS.SETTINGS, label: t('menu.settings'), icon: '⚙️', component: MenuSettings },
  { id: 'logout', label: t('menu.logout'), icon: '🚪', class: 'mt-8 border-gray-400 opacity-80' },
  { id: 'close', label: t('menu.backToGame'), icon: '🎮', class: 'border-red-500 text-red-600 hover:bg-red-50' }
]);

const activeItemLabel = computed(() => {
  return menuItems.value.find(item => item.id === activeDetailTab.value)?.label || '';
});

const activeComponent = computed(() => {
  return menuItems.value.find(item => item.id === activeDetailTab.value)?.component;
});

const handleMenuClick = (item) => {
  if (item.id === 'logout') {
    playerStore.logout();
  } else if (item.id === 'close') {
    emit('close');
  } else {
    activeDetailTab.value = item.id;
  }
};

const { selectedIndex } = useKeyboardNavigation({
  id: 'main-menu',
  priority: INPUT_PRIORITIES.MENU,
  maxIndex: computed(() => menuItems.value.length),
  isActive: computed(() => !activeDetailTab.value),
  onConfirm: (idx) => {
    if (!activeDetailTab.value) {
      handleMenuClick(menuItems.value[idx]);
    }
  },
  onCancel: () => {
    if (activeDetailTab.value) {
      activeDetailTab.value = null;
    } else {
      emit('close');
    }
  }
});

watch(selectedIndex, (newIdx) => {
  if (!activeDetailTab.value && itemRefs.value[newIdx]) {
    itemRefs.value[newIdx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
});
</script>
