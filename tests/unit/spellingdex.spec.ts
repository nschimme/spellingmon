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

  it('provides accessible button semantics, tabindex, and contextual aria-labels', async () => {
    const session = useSessionStore();
    session.dex.words = {
      1: {
        'cat': 'mastered',
        'dog': 'seen'
      }
    };

    const wrapper = mount(MenuSpellingdex);
    await new Promise(resolve => setTimeout(resolve, 50));

    const buttons = wrapper.findAll('[role="button"]');
    // We have 2 word cards rendered as role="button"
    expect(buttons.length).toBe(2);

    expect(buttons[0].attributes('tabindex')).toBe('0');
    expect(buttons[0].attributes('aria-label')).toBe('cat, Mastered: A feline');

    expect(buttons[1].attributes('tabindex')).toBe('0');
    expect(buttons[1].attributes('aria-label')).toBe('dog, Seen: A canine');

    // Emoji has aria-hidden="true"
    const emojis = wrapper.findAll('.text-2xl[aria-hidden="true"]');
    expect(emojis.length).toBe(2);

    // Enter or click triggers activation/selection
    await buttons[1].trigger('keydown', { key: 'Enter' });
    expect(buttons[1].attributes('aria-pressed')).toBe('true');
  });

  it('provides locked aria-label for undiscovered words', async () => {
    const session = useSessionStore();
    session.dex.words = { 1: {} };

    const wrapper = mount(MenuSpellingdex);
    await new Promise(resolve => setTimeout(resolve, 50));

    const buttons = wrapper.findAll('[role="button"]');
    expect(buttons[0].attributes('aria-label')).toBe('??? - Area Information Locked');
  });
});
