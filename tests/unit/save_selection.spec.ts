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

  it('renders radiogroup and radio slots with ARIA attributes', () => {
    const wrapper = mountSaveSelection();

    const radiogroup = wrapper.find('[role="radiogroup"]');
    expect(radiogroup.exists()).toBe(true);

    const radioSlots = wrapper.findAll('[role="radio"]');
    expect(radioSlots.length).toBe(3);

    radioSlots.forEach((slot, index) => {
      expect(slot.attributes('tabindex')).toBe('0');
      expect(slot.attributes('aria-label')).toBeDefined();
      expect(slot.attributes('aria-label')).toContain(`${index + 1}`);
    });
  });

  it('has initial aria-checked set to true for the selected slot', () => {
    const wrapper = mountSaveSelection();
    const radioSlots = wrapper.findAll('[role="radio"]');

    expect(radioSlots[0].attributes('aria-checked')).toBe('true');
    expect(radioSlots[1].attributes('aria-checked')).toBe('false');
    expect(radioSlots[2].attributes('aria-checked')).toBe('false');
  });

  it('renders back button with hidden arrow glyph', () => {
    const wrapper = mountSaveSelection();
    const backBtn = wrapper.find('button');
    expect(backBtn.exists()).toBe(true);

    const hiddenSpan = backBtn.find('span[aria-hidden="true"]');
    expect(hiddenSpan.exists()).toBe(true);
    expect(hiddenSpan.text()).toBe('←');
  });
});
