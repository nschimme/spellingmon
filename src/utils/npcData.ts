import { NPC_TYPES } from './constants';

export interface NPCConfig {
  id: string;
  type: string;
  nameKey: string;
  emoji: string;
  dialogs: {
    intro: string;
    victory?: string; // When the NPC wins (player loses)
    defeat?: string;  // When the NPC loses (player wins)
    mercy?: string;   // Special case like Rival
  };
}

export const SPECIAL_NPCS: Record<string, NPCConfig> = {
  mom: {
    id: 'mom',
    type: NPC_TYPES.MOM,
    nameKey: 'npc.mom.name',
    emoji: '👩‍🍳',
    dialogs: {
      intro: 'npc.mom.dialog'
    }
  },
  healer: {
    id: 'healer',
    type: NPC_TYPES.HEALER,
    nameKey: 'npc.healer.name',
    emoji: '👩‍⚕️',
    dialogs: {
      intro: 'npc.healer.dialog'
    }
  },
  rival_1: {
    id: 'rival_1',
    type: NPC_TYPES.RIVAL,
    nameKey: 'npc.rival.name',
    emoji: '🏃',
    dialogs: {
      intro: 'npc.rival.dialog',
      victory: 'npc.rival.victory',
      defeat: 'npc.rival.defeat',
      mercy: 'npc.rival.mercy'
    }
  }
};

export const GYM_BOSS_CONFIGS: Record<number, { name: string; emoji: string }> = {
  1: { name: 'npc.gym_boss.1.name', emoji: '🍎' },
  2: { name: 'npc.gym_boss.2.name', emoji: '🌪️' },
  3: { name: 'npc.gym_boss.3.name', emoji: '💧' },
  4: { name: 'npc.gym_boss.4.name', emoji: '⛰️' },
  5: { name: 'npc.gym_boss.5.name', emoji: '🏔️' },
  6: { name: 'npc.gym_boss.6.name', emoji: '⚓' },
  7: { name: 'npc.gym_boss.7.name', emoji: '🌀' },
  8: { name: 'npc.gym_boss.8.name', emoji: '🌲' },
  9: { name: 'npc.gym_boss.9.name', emoji: '🧙' }
};

export const getGymBossConfig = (area: number): NPCConfig => {
  const config = GYM_BOSS_CONFIGS[area] || { name: 'npc.gym_boss.name', emoji: '🏋️' };
  return {
    id: `gym_boss_${area}`,
    type: area === 9 ? NPC_TYPES.TEAM_STORM : NPC_TYPES.GYM_BOSS,
    nameKey: config.name,
    emoji: config.emoji,
    dialogs: {
      intro: `npc.gym_boss.${area}.intro`,
      defeat: `npc.gym_boss.${area}.defeat`
    }
  };
};

export function getTrainerDisplayName(rawName: string, t: (key: string) => string): string {
  if (rawName.includes('::')) {
    const [key, raw] = rawName.split('::');
    return `${t(key)} ${raw}`;
  }
  if (rawName.startsWith('npc.') || rawName.startsWith('trainer.')) {
    return t(rawName);
  }
  return rawName;
}

export const TRAINER_DATA = {
  titles: [
    'trainer.titles.spelling_bee',
    'trainer.titles.grammar_geek',
    'trainer.titles.vocab_victor',
    'trainer.titles.linguist',
    'trainer.titles.prose_pro',
    'trainer.titles.word_wizard',
    'trainer.titles.syntax_sage',
    'trainer.titles.lexis_legend'
  ],
  storm_titles: [
    'trainer.titles.storm_grunt',
    'trainer.titles.storm_scout',
    'trainer.titles.storm_operative'
  ],
  dialogs: {
    intro: [
      'trainer.dialogs.intro_1',
      'trainer.dialogs.intro_2',
      'trainer.dialogs.intro_3',
      'trainer.dialogs.intro_4',
      'trainer.dialogs.intro_5'
    ],
    defeat: [
      'trainer.dialogs.defeat_1',
      'trainer.dialogs.defeat_2',
      'trainer.dialogs.defeat_3'
    ],
    storm_intro: [
      'trainer.dialogs.storm_intro_1',
      'trainer.dialogs.storm_intro_2',
      'trainer.dialogs.storm_intro_3',
      'trainer.dialogs.storm_intro_4',
      'trainer.dialogs.storm_intro_5'
    ],
    storm_defeat: [
      'trainer.dialogs.storm_defeat_1',
      'trainer.dialogs.storm_defeat_2',
      'trainer.dialogs.storm_defeat_3'
    ],
    storm_catchphrase: 'trainer.dialogs.storm_catchphrase'
  }
};
