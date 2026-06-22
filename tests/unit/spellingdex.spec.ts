import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import MenuSpellingdex from '../../src/components/menu/MenuSpellingdex.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useSessionStore } from '../../src/stores/sessionStore';

// Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  json: vi.fn().mockResolvedValue([
    { word: 'cat', definition: 'A feline', emoji: '🐱' },
    { word: 'dog', definition: 'A canine', emoji: '🐶' }
  ])
});

describe('MenuSpellingdex', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('renders correctly and fetches words', async () => {
    const wrapper = mount(MenuSpellingdex);
    expect(wrapper.text()).toContain('area1');
    // Wait for fetch
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(global.fetch).toHaveBeenCalled();
  });

  it('shows ??? for undiscovered words', async () => {
    const session = useSessionStore();
    session.dex.words = { 1: {} };

    const wrapper = mount(MenuSpellingdex);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(wrapper.text()).toContain('???');
  });

  it('reveals words when discovered', async () => {
    const session = useSessionStore();
    session.dex.words = { 1: { 'cat': 'seen' } };

    const wrapper = mount(MenuSpellingdex);
    await new Promise(resolve => setTimeout(resolve, 50));
    expect(wrapper.text().toLowerCase()).toContain('cat');
  });
});
