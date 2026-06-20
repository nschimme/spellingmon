import { defineStore } from 'pinia';
import { computed } from 'vue';
import { createFSM, type FSMConfig } from '../utils/fsm';
import { useSessionStore } from './sessionStore';
import { useSettingsStore } from './settingsStore';
import { useVocabStore } from './vocabStore';
import { useMapStore } from './mapStore';
import { audio } from '../utils/audio';
import { speech } from '../utils/speech';
import { SOUND_EFFECTS, BATTLE_TYPES, ANIMATION_DURATIONS, GAME_STATES, GAME_EVENTS } from '../utils/constants';
import { type Monster, calculateExpGain, calculateDamage, calculateTimerDuration, createMon, SPECIES } from '../utils/gameData';
import { validateSpelling } from '../utils/spelling';
import i18n from '../i18n';

export const useGameFSM = defineStore('gameFSM', () => {
  const session = useSessionStore();
  const settings = useSettingsStore();
  const vocab = useVocabStore();
  const mapStore = useMapStore();
  const { t } = i18n.global;

  const context = {
    get session() { return session; },
    get settings() { return settings; },
    get vocab() { return vocab; },
    get map() { return mapStore; },
    get fsm() { return fsm; },
    get t() { return t; }
  };

  if (typeof window !== 'undefined') (window as any).__GAME_CONTEXT__ = context;

  const s = (state: string) => state.split('.').pop()!;

  const config: FSMConfig = {
    debug: false,
    initial: GAME_STATES.BOOTING,
    states: {
      [GAME_STATES.BOOTING]: {
        onEnter: async (ctx) => {
          await ctx.settings.init();

          // Handle Debug Mode
          if (typeof window === 'undefined') {
            await ctx.fsm.transition(GAME_STATES.LANDING);
            return;
          }
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('debug') === 'true') {
             ctx.settings.confirmTtsVerified();
             if (urlParams.get('locale')) {
                await ctx.settings.setLocale(urlParams.get('locale'));
             }

             const slot = parseInt(urlParams.get('slot') || '0');
             ctx.session.setSlot(slot);

             const name = urlParams.get('name') || 'Tester';
             ctx.session.player.name = name;

             const starter = urlParams.get('starter') || 'Grammander';
             const speciesName = Object.values(SPECIES).find(v => v.toLowerCase() === starter.toLowerCase()) || SPECIES.Grammander;
             const playerMon = createMon(speciesName, 5);
             ctx.session.player.party = [playerMon];
             ctx.session.player.isStarterSelected = true;
             ctx.session.player.characterCreationComplete = true;

             const jumpState = urlParams.get('state');
             if (jumpState && Object.values(GAME_STATES).includes(jumpState)) {
                // Robust Debug Jump via Smart LOADING gateway
                await ctx.fsm.transition(GAME_STATES.LOADING, { target: jumpState });
                return;
             }

             if (urlParams.get('battle') === 'true') {
                const enemy = createMon(SPECIES.Verminverb, 5);
                ctx.session.battle.enemyMon = enemy;
                ctx.session.battle.type = BATTLE_TYPES.WILD;
                ctx.session.battle.playerMonId = playerMon.id;
                ctx.session.battle.participatingMonIds = [playerMon.id];

                if (urlParams.get('word')) {
                   ctx.session.battle.debugWord = urlParams.get('word');
                   await ctx.fsm.transition(GAME_STATES.BATTLE_SPELLING);
                } else {
                   await ctx.fsm.transition(GAME_STATES.BATTLE_INTRO, { enemy, type: BATTLE_TYPES.WILD });
                }
                return;
             }

             await ctx.fsm.transition(GAME_STATES.WORLD);
             return;
          }

          await ctx.fsm.transition(GAME_STATES.LANDING);
        }
      },
      [GAME_STATES.LANDING]: {
        on: {
          [GAME_EVENTS.START]: (ctx) => {
            if (ctx.settings.ttsVerified) return GAME_STATES.SAVE_SELECTION;
            return GAME_STATES.LANGUAGE_SELECT;
          }
        }
      },
      [GAME_STATES.LANGUAGE_SELECT]: {
        on: {
          [GAME_EVENTS.SELECT_LANG]: (ctx, params) => {
             ctx.settings.setLocale(params.locale);
             return GAME_STATES.TTS_CHECK;
          },
          [GAME_EVENTS.VERIFIED]: GAME_STATES.SAVE_SELECTION
        }
      },
      [GAME_STATES.TTS_CHECK]: {
        onEnter: (ctx) => {
          speech.speak(ctx.t('tts.testPhrase'));
        },
        on: {
          [GAME_EVENTS.CONFIRM]: (ctx) => {
            ctx.settings.confirmTtsVerified();
            return GAME_STATES.SAVE_SELECTION;
          },
          [GAME_EVENTS.BACK]: GAME_STATES.LANGUAGE_SELECT
        }
      },
      [GAME_STATES.SAVE_SELECTION]: {
        on: {
          [GAME_EVENTS.SELECT_SLOT]: (ctx, params) => {
            ctx.session.setSlot(params.slot);
            return GAME_STATES.LOADING;
          },
          [GAME_EVENTS.BACK]: GAME_STATES.LANDING
        }
      },
      [GAME_STATES.LOADING]: {
        onEnter: async (ctx, params) => {
          const startTime = Date.now();
          const target = params?.target || (ctx.session.player.characterCreationComplete
            ? (ctx.session.player.isStarterSelected ? GAME_STATES.WORLD : GAME_STATES.STARTER_SELECTION)
            : GAME_STATES.CHARACTER_CREATION);

          // SMART GATEWAY: Resolve requirements based on metadata
          // Recursively check metadata for the target state and its parents
          const requirements = getRequirements(target);

          if (requirements.vocab || requirements.map) {
             const loaders = [];
             if (requirements.vocab) loaders.push(ctx.vocab.loadVocab(ctx.session.player.currentArea, ctx.settings.locale));
             if (requirements.map) loaders.push(ctx.map.generateMap(params?.isTransition, params?.direction));
             await Promise.all(loaders);
          }

          // Ensure a minimum "nice" delay, but wait longer if generation is slow
          const minDelay = params?.target ? 0 : 1500; // Skip delay for debug jumps
          const elapsed = Date.now() - startTime;
          if (elapsed < minDelay) {
            await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
          }

          await ctx.fsm.transition(target, params);
        }
      },
      [s(GAME_STATES.ONBOARDING)]: {
        states: {
          [s(GAME_STATES.CHARACTER_CREATION)]: {
            on: { [GAME_EVENTS.COMPLETE]: GAME_STATES.STORY_CUTSCENE }
          },
          [s(GAME_STATES.STARTER_SELECTION)]: {
            on: { [GAME_EVENTS.COMPLETE]: GAME_STATES.LOADING }
          }
        }
      },
      [s(GAME_STATES.PLAY)]: {
        initial: s(GAME_STATES.WORLD),
        meta: { vocab: true, map: true },
        states: {
          [s(GAME_STATES.WORLD)]: {
            onEnter: async (ctx) => {
              if (ctx.session.battle.active) {
                 await ctx.fsm.transition(GAME_STATES.BATTLE);
              }
            },
            on: {
              [GAME_EVENTS.ENCOUNTER]: (ctx, params) => {
                 if (params.type === BATTLE_TYPES.TRAINER) return GAME_STATES.TRAINER_APPROACH;
                 return GAME_STATES.BATTLE_INTRO;
              },
              [GAME_EVENTS.COMPLETE]: (ctx, params) => {
                if (params?.type === 'area') return GAME_STATES.STORY_CUTSCENE;
                return null;
              },
              [GAME_EVENTS.OPEN_MENU]: GAME_STATES.MENU,
              [GAME_EVENTS.EVOLVE]: GAME_STATES.EVOLUTION,
              [GAME_EVENTS.LOGOUT]: (ctx) => {
                ctx.session.activeSlot = null;
                return GAME_STATES.LANDING;
              }
            }
          },
          [s(GAME_STATES.TRAINER_APPROACH)]: {
             on: { [GAME_EVENTS.CONFIRM]: GAME_STATES.BATTLE_INTRO }
          },
          [s(GAME_STATES.BATTLE)]: {
            initial: s(GAME_STATES.BATTLE_INTRO),
            onEnter: (ctx) => { ctx.session.battle.active = true; },
            onExit: (ctx) => { ctx.session.battle.active = false; },
            states: {
              [s(GAME_STATES.BATTLE_INTRO)]: {
                onEnter: async (ctx, params) => {
                  if (params.enemy) {
                    ctx.session.battle.enemyMon = params.enemy;
                    ctx.session.battle.type = params.type || BATTLE_TYPES.WILD;
                    ctx.session.battle.trainerId = params.trainerId;
                    ctx.session.battle.trainerParty = params.trainerParty || [];
                    ctx.session.battle.playerMonId = ctx.session.player.party.find((m: Monster) => m.hp > 0)?.id;
                    ctx.session.battle.log = [ctx.t('battle.wildAppeared', { name: ctx.t('monsters.' + params.enemy.species) })];
                    ctx.session.battle.participatingMonIds = [ctx.session.battle.playerMonId];
                  }
                  audio.playSound(SOUND_EFFECTS.BATTLE_START);
                  setTimeout(() => ctx.fsm.transition(GAME_STATES.BATTLE_ACTION_SELECT), ANIMATION_DURATIONS.FLASH_MS + 500);
                }
              },
              [s(GAME_STATES.BATTLE_ACTION_SELECT)]: {
                on: {
                  [GAME_EVENTS.ATTACK]: (ctx) => {
                    ctx.session.battle.isCapturing = false;
                    return GAME_STATES.BATTLE_SPELLING;
                  },
                  [GAME_EVENTS.CAPTURE]: (ctx) => {
                    ctx.session.battle.isCapturing = true;
                    return GAME_STATES.BATTLE_SPELLING;
                  },
                  [GAME_EVENTS.SWITCH]: GAME_STATES.BATTLE_SWITCHING,
                  [GAME_EVENTS.RUN]: (ctx) => {
                    if (ctx.session.battle.type === BATTLE_TYPES.TRAINER) {
                       ctx.session.notify(ctx.t('battle.cannotRun'));
                       return null;
                    }
                    const success = Math.random() > 0.5;
                    if (success) return GAME_STATES.WORLD;
                    ctx.session.battle.log.push(ctx.t('battle.cannotEscape'));
                    return GAME_STATES.BATTLE_ENEMY_TURN;
                  }
                }
              },
              [s(GAME_STATES.BATTLE_SWITCHING)]: {
                on: {
                  [GAME_EVENTS.CONFIRM]: (ctx, params) => {
                    ctx.session.battle.playerMonId = params.monId;
                    if (!ctx.session.battle.participatingMonIds.includes(params.monId)) {
                      ctx.session.battle.participatingMonIds.push(params.monId);
                    }
                    ctx.session.battle.log.push(ctx.t('battle.go', { name: ctx.t('monsters.' + ctx.session.activePlayerMon.species) }));
                    return GAME_STATES.BATTLE_ENEMY_TURN;
                  },
                  [GAME_EVENTS.CANCEL]: GAME_STATES.BATTLE_ACTION_SELECT
                }
              },
              [s(GAME_STATES.BATTLE_SPELLING)]: {
                onEnter: (ctx) => {
                  let wordObj;
                  if (ctx.session.battle.debugWord) {
                     wordObj = { word: ctx.session.battle.debugWord, difficulty: 1, definition: 'Debug word', sentence_context: 'Debug.' };
                     ctx.session.battle.debugWord = null;
                  } else {
                     wordObj = ctx.vocab.getRandomWord(ctx.session.player.currentArea, ctx.settings.locale);
                  }
                  ctx.session.battle.currentWord = wordObj;
                  ctx.session.recordDiscovery('discoveredWords', ctx.session.player.currentArea, wordObj.word);
                  const time = calculateTimerDuration(wordObj, ctx.session.battle.isCapturing);
                  ctx.session.battle.totalTime = time;
                  ctx.session.battle.startTime = Date.now();

                  const spokenVersion = wordObj.spoken_version || wordObj.word;
                  speech.speak(spokenVersion);
                  if (wordObj.sentence_context) {
                    setTimeout(() => {
                      speech.speak(`${ctx.t('battle.asIn')} ${wordObj.sentence_context}`);
                      setTimeout(() => {
                        speech.speak(spokenVersion);
                      }, 3000);
                    }, 1500);
                  }
                },
                on: {
                  [GAME_EVENTS.SUBMIT]: (ctx, params) => {
                    const elapsed = (Date.now() - ctx.session.battle.startTime) / 1000;
                    const timeLeft = Math.max(0, ctx.session.battle.totalTime - elapsed);
                    const { isCorrect, isPerfect } = validateSpelling(params.input, ctx.session.battle.currentWord.word);

                    if (isCorrect) {
                      const isPower = timeLeft > (ctx.session.battle.totalTime / 2);
                      let basePower = 30;
                      if (isPerfect && isPower) basePower = 75;
                      else if (isPerfect) basePower = 60;
                      else if (isPower) basePower = 45;

                      return {
                        target: GAME_STATES.BATTLE_PLAYER_ATTACK,
                        params: { power: basePower, isPerfect, isPower, isCorrect: true }
                      };
                    } else {
                      ctx.session.battle.log.push(ctx.t('battle.incorrect'));
                      return {
                        target: GAME_STATES.BATTLE_ENEMY_TURN,
                        params: { isCorrect: false }
                      };
                    }
                  }
                }
              },
              [s(GAME_STATES.BATTLE_PLAYER_ATTACK)]: {
                onEnter: async (ctx, params) => {
                   if (ctx.session.battle.isCapturing) {
                      const hpRatio = ctx.session.battle.enemyMon.hp / ctx.session.battle.enemyMon.maxHp;
                      const speedBonus = params.isPower ? 0.2 : 0;
                      const successChance = (0.7 - (hpRatio * 0.5)) + speedBonus;

                      if (Math.random() < successChance) {
                        audio.playSound(SOUND_EFFECTS.CAPTURE_SUCCESS);
                        ctx.session.battle.log.push(ctx.t('battle.catchSuccess', { name: ctx.t('monsters.' + ctx.session.battle.enemyMon.species) }));
                        const added = ctx.session.addMonToParty({...ctx.session.battle.enemyMon, hp: ctx.session.battle.enemyMon.maxHp});
                        if (added) {
                          setTimeout(() => ctx.fsm.transition(GAME_STATES.WORLD), 1500);
                        } else {
                          setTimeout(() => ctx.fsm.transition(GAME_STATES.BATTLE_PARTY_FULL), 1000);
                        }
                      } else {
                        audio.playSound(SOUND_EFFECTS.CAPTURE_FAIL);
                        ctx.session.battle.log.push(ctx.t('battle.catchFail', { name: ctx.t('monsters.' + ctx.session.battle.enemyMon.species) }));
                        setTimeout(() => ctx.fsm.transition(GAME_STATES.BATTLE_ENEMY_TURN), 1000);
                      }
                      return;
                   }

                   const { damage, typeMod } = calculateDamage(ctx.session.activePlayerMon, ctx.session.battle.enemyMon, params.power || 30);
                   ctx.session.damageEnemy(damage);
                   ctx.session.battle.log.push(ctx.t('battle.dealtDamage', { amount: damage }));
                   if (typeMod > 1) ctx.session.battle.log.push(ctx.t('battle.superEffective'));
                   audio.playSound(SOUND_EFFECTS.HIT);

                   setTimeout(() => {
                     if (ctx.session.battle.enemyMon.hp <= 0) ctx.fsm.transition(GAME_STATES.BATTLE_VICTORY);
                     else ctx.fsm.transition(GAME_STATES.BATTLE_ENEMY_TURN);
                   }, 1000);
                }
              },
              [s(GAME_STATES.BATTLE_ENEMY_TURN)]: {
                onEnter: async (ctx) => {
                   const { damage } = calculateDamage(ctx.session.battle.enemyMon, ctx.session.activePlayerMon, 30);
                   ctx.session.damagePlayerMon(damage);
                   ctx.session.battle.log.push(ctx.t('battle.enemyAttacked', { name: ctx.t('monsters.' + ctx.session.battle.enemyMon.species), amount: damage }));
                   audio.playSound(SOUND_EFFECTS.HIT);
                   setTimeout(() => {
                     if (ctx.session.activePlayerMon.hp <= 0) {
                        ctx.session.battle.log.push(ctx.t('battle.lose', { name: ctx.t('monsters.' + ctx.session.activePlayerMon.species) }));
                        if (ctx.session.player.party.some((m: Monster) => m.hp > 0)) {
                          ctx.fsm.transition(GAME_STATES.BATTLE_SWITCHING);
                        } else {
                          ctx.fsm.transition(GAME_STATES.BATTLE_WHITED_OUT);
                        }
                     } else {
                       ctx.fsm.transition(GAME_STATES.BATTLE_ACTION_SELECT);
                     }
                   }, 1000);
                }
              },
              [s(GAME_STATES.BATTLE_WHITED_OUT)]: {
                onEnter: () => { audio.playSound(SOUND_EFFECTS.FAINT); },
                on: {
                  [GAME_EVENTS.CONFIRM]: (ctx) => {
                    ctx.session.healParty();
                    if (ctx.session.player.lastSpellCenter) {
                       ctx.session.updatePlayerPosition({ x: ctx.session.player.lastSpellCenter.x, y: ctx.session.player.lastSpellCenter.y });
                    }
                    return GAME_STATES.WORLD;
                  }
                }
              },
              [s(GAME_STATES.BATTLE_VICTORY)]: {
                onEnter: async (ctx) => {
                  ctx.session.battle.log.push(ctx.t('battle.win', { name: ctx.t('monsters.' + ctx.session.battle.enemyMon.species) }));
                  audio.playSound(SOUND_EFFECTS.VICTORY);
                  const exp = calculateExpGain(ctx.session.battle.enemyMon, ctx.session.battle.type === BATTLE_TYPES.TRAINER);
                  ctx.session.battle.results = ctx.session.awardExp(exp);
                  setTimeout(() => ctx.fsm.transition(GAME_STATES.BATTLE_RESULTS), 2000);
                }
              },
              [s(GAME_STATES.BATTLE_RESULTS)]: {
                on: { [GAME_EVENTS.CONTINUE]: GAME_STATES.WORLD }
              },
              [s(GAME_STATES.BATTLE_PARTY_FULL)]: {
                on: {
                  [GAME_EVENTS.REPLACE]: (ctx, params) => {
                    const index = ctx.session.player.party.findIndex((m: Monster) => m.id === params.replaceMonId);
                    if (index !== -1) {
                      ctx.session.player.party[index] = {...ctx.session.battle.enemyMon, hp: ctx.session.battle.enemyMon.maxHp};
                      ctx.session.save();
                    }
                    return GAME_STATES.WORLD;
                  },
                  [GAME_EVENTS.RELEASE]: GAME_STATES.WORLD
                }
              }
            }
          },
          [s(GAME_STATES.MENU)]: {
            on: { [GAME_EVENTS.CLOSE]: GAME_STATES.WORLD }
          },
          [s(GAME_STATES.EVOLUTION)]: {
            on: { [GAME_EVENTS.FINISH]: GAME_STATES.WORLD }
          },
          [s(GAME_STATES.STORY_CUTSCENE)]: {
            on: {
              [GAME_EVENTS.FINISH]: (ctx) => {
                if (!ctx.session.player.isStarterSelected) return GAME_STATES.STARTER_SELECTION;
                if (ctx.session.player.currentArea >= 9) return GAME_STATES.LANDING; // Or a credits roll state
                return GAME_STATES.WORLD;
              }
            }
          }
        }
      }
    }
  };

  const getRequirements = (target: string) => {
    const parts = target.split('.');
    const requirements = { vocab: false, map: false };

    for (let i = 1; i <= parts.length; i++) {
      const path = parts.slice(0, i).join('.');
      const cfg = path.split('.').reduce((obj: any, key: string) => obj?.states?.[key], config) as any;
      if (cfg?.meta) {
        if (cfg.meta.vocab) requirements.vocab = true;
        if (cfg.meta.map) requirements.map = true;
      }
    }
    return requirements;
  };

  const fsm = createFSM(config, context);
  if (typeof window !== 'undefined') (window as any).__FSM__ = fsm;
  fsm.init();

  const currentParams = computed(() => fsm.params.value);

  return {
    state: fsm.state,
    params: currentParams,
    send: fsm.send,
    transition: fsm.transition,
    matches: fsm.matches
  };
});
