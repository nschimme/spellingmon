import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import i18n from '../../src/i18n';
import SaveSelection from '../../src/components/SaveSelection.vue';

describe('SaveSelection.vue Accessibility & ARIA', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const mountSaveSelection = () => {
    return mount(SaveSelection, {
      global: {
        plugins: [i18n]
      }
    });
  };

  it('renders radiogroup and radio slots with exact ARIA slot numbers', () => {
    const wrapper = mountSaveSelection();

    const radiogroup = wrapper.find('[role="radiogroup"]');
    expect(radiogroup.exists()).toBe(true);

    const radioSlots = wrapper.findAll('[role="radio"]');
    expect(radioSlots.length).toBe(3);

    radioSlots.forEach((slot, index) => {
      expect(slot.attributes('tabindex')).toBe('0');
      const label = slot.attributes('aria-label');
      expect(label).toBe(`Slot ${index + 1}: New Game`);
    });
  });

  it('has initial aria-checked set to true for slot 1 and updates on selection', async () => {
    const wrapper = mountSaveSelection();
    const radioSlots = wrapper.findAll('[role="radio"]');

    expect(radioSlots[0].attributes('aria-checked')).toBe('true');
    expect(radioSlots[1].attributes('aria-checked')).toBe('false');

    await radioSlots[1].trigger('click');
    const updatedSlots = wrapper.findAll('[role="radio"]');
    expect(updatedSlots[1].attributes('aria-checked')).toBe('true');
  });

  it('makes background content inert when a dialog is open', async () => {
    const wrapper = mountSaveSelection();
    const bgContainer = wrapper.find('.z-10');

    expect(bgContainer.attributes('inert')).toBe('false');

    const slots = wrapper.findAll('[role="radio"]');
    await slots[0].trigger('click');

    expect(bgContainer.attributes('inert')).toBe('true');
  });

  it('renders back button with hidden arrow glyph trimmed text', () => {
    const wrapper = mountSaveSelection();
    const backBtn = wrapper.find('button');
    expect(backBtn.exists()).toBe(true);

    const hiddenSpan = backBtn.find('span[aria-hidden="true"]');
    expect(hiddenSpan.exists()).toBe(true);
    expect(hiddenSpan.text().trim()).toBe('←');
  });
});
