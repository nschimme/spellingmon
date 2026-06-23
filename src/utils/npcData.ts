export interface NPCConfig {
  id: string;
  type: 'mom' | 'healer' | 'gym_boss' | 'rival' | 'trainer';
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
    type: 'mom',
    nameKey: 'npc.mom.name',
    emoji: '👩‍🍳',
    dialogs: {
      intro: 'npc.mom.dialog'
    }
  },
  healer: {
    id: 'healer',
    type: 'healer',
    nameKey: 'npc.healer.name',
    emoji: '👩‍⚕️',
    dialogs: {
      intro: 'npc.healer.dialog'
    }
  },
  rival_1: {
    id: 'rival_1',
    type: 'rival',
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

export const getGymBossConfig = (area: number): NPCConfig => ({
  id: `gym_boss_${area}`,
  type: 'gym_boss',
  nameKey: 'npc.gym_boss.name',
  emoji: '🏋️',
  dialogs: {
    intro: 'npc.gym_boss.intro',
    defeat: 'npc.gym_boss.defeat'
  }
});

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
    ]
  }
};
