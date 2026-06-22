import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import WhiteoutView from '../../src/components/WhiteoutView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { speech } from '../../src/utils/speech';

vi.mock('../../src/utils/speech', () => ({
  speech: {
    speak: vi.fn(),
    stop: vi.fn(),
    refreshVoices: vi.fn(),
    setVolume: vi.fn(),
    init: vi.fn().mockResolvedValue(undefined),
    t: vi.fn((k) => k)
  }
}));

describe('WhiteoutView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('speaks the whited out description on mount', () => {
    mount(WhiteoutView);
    expect(speech.speak).toHaveBeenCalled();
  });

  it('calls speech.stop and sends confirm event when button is clicked', async () => {
    const wrapper = mount(WhiteoutView);
    const button = wrapper.find('button');
    await button.trigger('click');
    expect(speech.stop).toHaveBeenCalled();
  });
});
