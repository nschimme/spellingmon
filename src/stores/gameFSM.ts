import { defineStore } from 'pinia';
import { computed } from 'vue';
import { createFSM, type FSMConfig } from '../utils/fsm';
import { useSessionStore } from './sessionStore';
import { useSettingsStore } from './settingsStore';
import { useVocabStore } from './vocabStore';
import { useMapStore } from './mapStore';
import { audio } from '../utils/audio';
import { speech } from '../utils/speech';
import { SOUND_EFFECTS, BATTLE_TYPES, ANIMATION_DURATIONS, GAME_STATES, GAME_EVENTS, SPAWN_POINTS, MOVE_IDS, STATUS_CONDITIONS, MOVE_EFFECT_TYPES } from '../utils/constants';
import { type Monster, type Move, MOVES, calculateExpGain, calculateDamage, calculateTimerDuration, createMon, getRivalStarter, SPECIES } from '../utils/gameData';
import { validateSpelling, getAISpellingPerformance } from '../utils/spelling';
import i18n from '../i18n';

function applyMoveEffect(ctx: any, attacker: Monster, defender: Monster, move: Move, damage: number) {
  const t = ctx.t;
  const log = ctx.session.battle.log;
  const chance = move.effectChance || 100;
  const roll = Math.random() * 100;

  if (roll > chance) return;

  const type = move.effectType;
  const stat = move.effectStat;
  const amount = move.effectAmount || 1;

  if (type === MOVE_EFFECT_TYPES.STAT_DOWN) {
     const target = defender;
     target.stages[stat!] = Math.max(-6, (target.stages[stat!] || 0) - amount);
     log.push(t(amount > 1 ? 'battle.statDown2' : 'battle.statDown', { mon: t('monsters.' + target.species), stat: t('battle.stats.' + stat) }));
  } else if (type === MOVE_EFFECT_TYPES.STAT_UP) {
     const target = attacker;
     target.stages[stat!] = Math.min(6, (target.stages[stat!] || 0) + amount);
     log.push(t(amount > 1 ? 'battle.statUp2' : 'battle.statUp', { mon: t('monsters.' + target.species), stat: t('battle.stats.' + stat) }));
  } else if (type === MOVE_EFFECT_TYPES.STATUS) {
     if (stat === 'CONFUSION') {
        if (!defender.confusionTurns) {
           defender.confusionTurns = 2 + Math.floor(Math.random() * 4);
           log.push(t('battle.isConfused', { name: t('monsters.' + defender.species) }));
        }
        return;
     }

     if (defender.status === STATUS_CONDITIONS.NONE) {
        // Type immunities
        if (stat === 'BURN' && defender.types.includes('Fire')) return;
        if (stat === 'POISON' && (defender.types.includes('Poison') || defender.types.includes('Steel'))) return;
        if (stat === 'PARALYSIS' && defender.types.includes('Electric')) return;

        defender.status = STATUS_CONDITIONS[stat as keyof typeof STATUS_CONDITIONS];
        if (defender.status === STATUS_CONDITIONS.SLEEP) {
           defender.statusTurns = 1 + Math.floor(Math.random() * 3);
        }
        log.push(t('battle.statusApplied', { mon: t('monsters.' + defender.species), status: t('battle.status.' + stat!.toLowerCase()) }));
     }
  } else if (type === MOVE_EFFECT_TYPES.HEAL) {
     const heal = Math.floor(attacker.maxHp / 2);
     attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
     log.push(t('battle.healed', { name: t('monsters.' + attacker.species) }));
  } else if (type === MOVE_EFFECT_TYPES.DRAIN) {
     const heal = Math.floor(damage / 2);
     attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal);
     log.push(t('battle.drained', { name: t('monsters.' + attacker.species) }));
  } else if (type === MOVE_EFFECT_TYPES.RECOIL) {
     const recoil = Math.floor(damage / 4);
     attacker.hp = Math.max(0, attacker.hp - recoil);
     log.push(t('battle.recoil', { name: t('monsters.' + attacker.species) }));
  }
}

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
                const jumpParams: any = { target: jumpState };
                urlParams.forEach((value, key) => {
                   if (key !== 'state' && key !== 'debug') {
                      jumpParams[key] = isNaN(Number(value)) ? value : Number(value);
                   }
                });
                await ctx.fsm.transition(GAME_STATES.LOADING, jumpParams);
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
          speech.speak(ctx.t('tts.testPhrase'), ctx.settings.locale);
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

          // Execute transition-specific logic before map generation
          if (params?.onComplete) {
            await params.onComplete();
          }

          // Ensure we use the latest state from the session store which was just patched in setSlot
          const target = params?.target || (ctx.session.player.characterCreationComplete
            ? (ctx.session.player.isStarterSelected ? GAME_STATES.WORLD : GAME_STATES.STARTER_SELECTION)
            : GAME_STATES.CHARACTER_CREATION);

          if (target === GAME_STATES.WORLD && ctx.session.player.currentInterior) {
            // Interior maps are rendered within the WorldMap component
          }

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
            on: { [GAME_EVENTS.COMPLETE]: { target: GAME_STATES.STORY_CUTSCENE, params: { type: 'intro' } } }
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
              [GAME_EVENTS.CONFIRM]: (ctx, params) => {
                if (params?.targetState === GAME_STATES.WORLD) {
                   return { target: GAME_STATES.LOADING, params };
                }
                if (params?.moving === true) {
                  return { target: GAME_STATES.MOVING, params };
                }
                if (params?.dialog) {
                  return { target: GAME_STATES.DIALOG, params };
                }
                return null;
              },
              [GAME_EVENTS.ENCOUNTER]: (ctx, params) => {
                 if (params.type === BATTLE_TYPES.TRAINER) return GAME_STATES.TRAINER_APPROACH;
                 return GAME_STATES.BATTLE_INTRO;
              },
              [GAME_EVENTS.COMPLETE]: (ctx, params) => {
                if (params?.type === 'area') {
                  return { target: GAME_STATES.STORY_CUTSCENE, params: { area: params.area } };
                }
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
          [s(GAME_STATES.MOVING)]: {
            onEnter: (ctx, params) => {
              ctx.session.clearNotification();
              const duration = params?.duration ?? GAME_CONSTANTS.MOBILE_MOVEMENT_REPEAT_MS;
              setTimeout(() => {
                if (ctx.session.player.party.every((m: Monster) => m.hp <= 0)) {
                   ctx.fsm.transition(GAME_STATES.BATTLE_WHITED_OUT);
                } else {
                   ctx.fsm.send(GAME_EVENTS.COMPLETE, params);
                }
              }, duration);
            },
            on: {
              [GAME_EVENTS.CONFIRM]: (ctx, params) => {
                 if (params?.moving === true) {
                    // Chained movement: restart MOVING state
                    return { target: GAME_STATES.MOVING, params };
                 }
                 return null;
              },
              [GAME_EVENTS.COMPLETE]: (ctx, params) => {
                if (params?.onComplete) params.onComplete();
                if (!ctx.fsm.matches(GAME_STATES.MOVING)) return null;
                return GAME_STATES.WORLD;
              },
              [GAME_EVENTS.ENCOUNTER]: (ctx, params) => {
                 if (params.type === BATTLE_TYPES.TRAINER) return GAME_STATES.TRAINER_APPROACH;
                 return GAME_STATES.BATTLE_INTRO;
              }
            }
          },
          [s(GAME_STATES.DIALOG)]: {
            onEnter: (ctx, params) => {
              if (params?.onEnter) params.onEnter();
            },
            on: {
              [GAME_EVENTS.CONFIRM]: (ctx) => {
                const hasNext = ctx.session.nextDialog();
                if (!hasNext) {
                   const onComplete = ctx.fsm.params.value?.onComplete;
                   if (onComplete) onComplete();

                   if (ctx.fsm.params.value?.encounterParams) {
                      return {
                        target: GAME_STATES.BATTLE_INTRO,
                        params: ctx.fsm.params.value.encounterParams
                      };
                   }
                   return GAME_STATES.WORLD;
                }
                return null;
              },
              [GAME_EVENTS.ENCOUNTER]: (ctx, params) => {
                if (params.type === BATTLE_TYPES.TRAINER) return GAME_STATES.TRAINER_APPROACH;
                return GAME_STATES.BATTLE_INTRO;
              },
              [GAME_EVENTS.CLOSE]: (ctx) => {
                ctx.session.clearDialog();
                return GAME_STATES.WORLD;
              }
            }
          },
          [s(GAME_STATES.TRAINER_APPROACH)]: {
             on: {
               [GAME_EVENTS.CONFIRM]: (ctx, params) => {
                 if (params?.dialog) return { target: GAME_STATES.DIALOG, params };
                 return GAME_STATES.BATTLE_INTRO;
               }
             }
          },
          [s(GAME_STATES.BATTLE)]: {
            initial: s(GAME_STATES.BATTLE_INTRO),
            onEnter: (ctx) => { ctx.session.battle.active = true; },
            onExit: (ctx) => {
              ctx.session.battle.active = false;
              ctx.session.resetBattle();
            },
            states: {
              [s(GAME_STATES.BATTLE_INTRO)]: {
                onEnter: async (ctx, params) => {
                  if (params.enemy) {
                    let enemy = params.enemy;
                    let trainerParty = params.trainerParty || [];

                    // Rival Scaling Logic
                    if (params.trainerId === 'rival_1' && ctx.session.player.party.length > 0) {
                      const lead = ctx.session.player.party[0];

                      // Scale entire party based on player's lead level
                      trainerParty = (params.trainerParty || []).map((p: any) => ({
                         ...p,
                         level: lead.level
                      }));

                      // Select elemental opposite for the Rival's first mon
                      if (trainerParty.length > 0) {
                         trainerParty[0].species = getRivalStarter(lead.species);
                      } else {
                         trainerParty = [{ species: getRivalStarter(lead.species), level: lead.level }];
                      }

                      enemy = createMon(trainerParty[0].species, trainerParty[0].level);
                    }

                    ctx.session.battle.enemyMon = enemy;
                    ctx.session.battle.type = params.type || BATTLE_TYPES.WILD;
                    ctx.session.battle.trainerId = params.trainerId;
                    ctx.session.battle.trainerParty = trainerParty;
                    ctx.session.battle.trainerDefeatDialog = params.trainerDefeatDialog || null;
                    ctx.session.battle.isStorm = !!params.isStorm;
                    ctx.session.battle.isRival = !!params.isRival;
                    ctx.session.battle.playerMonId = ctx.session.player.party.find((m: Monster) => m.hp > 0)?.id;

                    if (params.type === BATTLE_TYPES.TRAINER) {
                      let displayName = params.trainerName || 'Trainer';
                      if (displayName.includes('::')) {
                        const [key, raw] = displayName.split('::');
                        displayName = `${ctx.t(key)} ${raw}`;
                      } else if (displayName.startsWith('npc.') || displayName.startsWith('trainer.')) {
                        displayName = ctx.t(displayName);
                      }
                      ctx.session.battle.log = [ctx.t('battle.trainerWantsToBattle', { name: displayName })];
                    } else {
                      ctx.session.battle.log = [ctx.t('battle.wildAppeared', { name: ctx.t('monsters.' + enemy.species) })];
                    }

                    ctx.session.battle.participatingMonIds = [ctx.session.battle.playerMonId];
                  }
                  audio.playSound(SOUND_EFFECTS.BATTLE_START);
                  setTimeout(() => ctx.fsm.transition(GAME_STATES.BATTLE_ACTION_SELECT), ANIMATION_DURATIONS.FLASH_MS + 500);
                }
              },
              [s(GAME_STATES.BATTLE_ACTION_SELECT)]: {
                onEnter: (ctx) => {
                  const mon = ctx.session.activePlayerMon!;
                  if (mon.status === STATUS_CONDITIONS.SLEEP) {
                    mon.statusTurns = (mon.statusTurns || 0) - 1;
                    if (mon.statusTurns <= 0) {
                      mon.status = STATUS_CONDITIONS.NONE;
                      ctx.session.battle.log.push(ctx.t('battle.wokeUp', { name: ctx.t('monsters.' + mon.species) }));
                    } else {
                      ctx.session.battle.log.push(ctx.t('battle.isAsleep', { name: ctx.t('monsters.' + mon.species) }));
                      setTimeout(() => ctx.fsm.transition(GAME_STATES.BATTLE_ENEMY_TURN), 1000);
                      return;
                    }
                  }
                  if (mon.status === STATUS_CONDITIONS.FREEZE) {
                    ctx.session.battle.log.push(ctx.t('battle.isFrozen', { name: ctx.t('monsters.' + mon.species) }));
                    setTimeout(() => ctx.fsm.transition(GAME_STATES.BATTLE_ENEMY_TURN), 1000);
                    return;
                  }
                },
                on: {
                  [GAME_EVENTS.ATTACK]: (ctx) => {
                    ctx.session.battle.isCapturing = false;
                    return GAME_STATES.BATTLE_MOVE_SELECT;
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
                    if (success) {
                       return GAME_STATES.WORLD;
                    }
                    ctx.session.battle.log.push(ctx.t('battle.cannotEscape'));
                      if (ctx.session.battle.type === BATTLE_TYPES.TRAINER) return GAME_STATES.BATTLE_ENEMY_SPELLING;
                    return GAME_STATES.BATTLE_ENEMY_TURN;
                  }
                }
              },
              [s(GAME_STATES.BATTLE_MOVE_SELECT)]: {
                on: {
                  [GAME_EVENTS.CONFIRM]: (ctx, params) => {
                    ctx.session.battle.selectedMoveId = params.moveId;
                    return GAME_STATES.BATTLE_SPELLING;
                  },
                  [GAME_EVENTS.BACK]: GAME_STATES.BATTLE_ACTION_SELECT
                }
              },
              [s(GAME_STATES.BATTLE_SWITCHING)]: {
                on: {
                  [GAME_EVENTS.CONFIRM]: (ctx, params) => {
                    ctx.session.battle.playerMonId = params.monId;
                    if (!ctx.session.battle.participatingMonIds.includes(params.monId)) {
                      ctx.session.battle.participatingMonIds.push(params.monId);
                    }
                    ctx.session.battle.log.push(ctx.t('battle.go', { name: ctx.t('monsters.' + ctx.session.activePlayerMon!.species) }));
                    if (ctx.session.battle.type === BATTLE_TYPES.TRAINER) return GAME_STATES.BATTLE_ENEMY_SPELLING;
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
                     wordObj = ctx.vocab.getRandomWord(ctx.session.player.currentArea, ctx.settings.locale, ctx.session);
                  }
                  ctx.session.battle.currentWord = wordObj;
                  const time = calculateTimerDuration(wordObj, ctx.session.battle.isCapturing);
                  ctx.session.battle.totalTime = time;
                  ctx.session.battle.startTime = Date.now();

                  const spokenVersion = wordObj.spoken_version || wordObj.word;
                  let fullText = spokenVersion;
                  if (wordObj.sentence_context) {
                    fullText = `${spokenVersion}. ${ctx.t('battle.asIn')} ${wordObj.sentence_context}. ${spokenVersion}.`;
                  }
                  speech.speak(fullText);
                },
                on: {
                  [GAME_EVENTS.SUBMIT]: (ctx, params) => {
                    const elapsed = (Date.now() - (ctx.session.battle.startTime || 0)) / 1000;
                    const timeLeft = Math.max(0, ctx.session.battle.totalTime - elapsed);
                    const { isCorrect, isPerfect } = validateSpelling(params.input, ctx.session.battle.currentWord!.word);

                    if (isCorrect) {
                      const status = isPerfect ? 'mastered' : 'correct';
                      ctx.session.recordWord(ctx.session.player.currentArea, ctx.session.battle.currentWord!.word, status);
                      const isPower = timeLeft > (ctx.session.battle.totalTime / 2);

                      return {
                        target: GAME_STATES.BATTLE_PLAYER_ATTACK,
                        params: { isPerfect, isPower, isCorrect: true }
                      };
                    } else {
                      ctx.session.recordWord(ctx.session.player.currentArea, ctx.session.battle.currentWord!.word, 'seen');
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
                   const attacker = ctx.session.activePlayerMon!;

                   if (attacker.confusionTurns) {
                      attacker.confusionTurns--;
                      if (attacker.confusionTurns <= 0) {
                         ctx.session.battle.log.push(ctx.t('battle.outOfConfusion', { name: ctx.t('monsters.' + attacker.species) }));
                      } else {
                         ctx.session.battle.log.push(ctx.t('battle.isConfused', { name: ctx.t('monsters.' + attacker.species) }));
                         if (Math.random() < 0.5) {
                            const confusionMove: Move = { id: 'confusion_self', name: 'Confusion', type: 'Normal', category: 'Physical', power: 40, accuracy: 100 };
                            const { damage } = calculateDamage(attacker, attacker, confusionMove, { isCorrect: true, isPerfect: false, isPower: false });
                            attacker.hp = Math.max(0, attacker.hp - damage);
                            ctx.session.battle.log.push(ctx.t('battle.hurtSelf'));
                            audio.playSound(SOUND_EFFECTS.HIT);
                            setTimeout(() => {
                               if (attacker.hp <= 0) {
                                 ctx.session.battle.log.push(ctx.t('battle.lose', { name: ctx.t('monsters.' + attacker.species) }));
                                 if (ctx.session.player.party.some((m: Monster) => m.hp > 0)) {
                                   ctx.fsm.transition(GAME_STATES.BATTLE_SWITCHING);
                                 } else {
                                   ctx.fsm.transition(GAME_STATES.BATTLE_WHITED_OUT);
                                 }
                               } else {
                                 ctx.fsm.transition(GAME_STATES.BATTLE_ENEMY_TURN);
                               }
                            }, 1000);
                            return;
                         }
                      }
                   }

                   if (attacker.status === STATUS_CONDITIONS.PARALYSIS && Math.random() < 0.25) {
                      ctx.session.battle.log.push(ctx.t('battle.isParalyzed', { name: ctx.t('monsters.' + attacker.species) }));
                      setTimeout(() => ctx.fsm.transition(GAME_STATES.BATTLE_ENEMY_TURN), 1000);
                      return;
                   }

                   const defender = ctx.session.battle.enemyMon!;

                   if (ctx.session.battle.isCapturing) {
                      const hpRatio = defender.hp / defender.maxHp;
                      const speedBonus = params.isPower ? 0.2 : 0;
                      const successChance = (0.7 - (hpRatio * 0.5)) + speedBonus;

                      if (Math.random() < successChance) {
                        audio.playSound(SOUND_EFFECTS.CAPTURE_SUCCESS);
                        ctx.session.battle.log.push(ctx.t('battle.catchSuccess', { name: ctx.t('monsters.' + ctx.session.battle.enemyMon!.species) }));
                        const added = ctx.session.addMonToParty({...ctx.session.battle.enemyMon!});
                        if (added) {
                          setTimeout(() => {
                            ctx.fsm.transition(GAME_STATES.WORLD);
                          }, 2000);
                        } else {
                          setTimeout(() => ctx.fsm.transition(GAME_STATES.BATTLE_PARTY_FULL), 1000);
                        }
                      } else {
                        audio.playSound(SOUND_EFFECTS.CAPTURE_FAIL);
                        ctx.session.battle.log.push(ctx.t('battle.catchFail', { name: ctx.t('monsters.' + ctx.session.battle.enemyMon!.species) }));
                        setTimeout(() => ctx.fsm.transition(GAME_STATES.BATTLE_ENEMY_TURN), 1000);
                      }
                      return;
                   }

                   const moveId = ctx.session.battle.selectedMoveId || MOVE_IDS.Tackle;
                   const move = MOVES[moveId];
                   const { damage, typeMod, isMiss } = calculateDamage(attacker, defender, move, params);

                   ctx.session.battle.log.push(ctx.t('battle.usedMove', { mon: ctx.t('monsters.' + attacker.species), move: ctx.t('moves.' + move.id) }));

                   if (isMiss) {
                      ctx.session.battle.log.push(ctx.t('battle.missed'));
                   } else {
                      if (damage > 0) {
                         ctx.session.damageEnemy(damage);
                         ctx.session.battle.log.push(ctx.t('battle.dealtDamage', { amount: damage }));
                         if (typeMod > 1) ctx.session.battle.log.push(ctx.t('battle.superEffective'));
                         if (typeMod < 1 && typeMod > 0) ctx.session.battle.log.push(ctx.t('battle.notVeryEffective'));
                         if (typeMod === 0) ctx.session.battle.log.push(ctx.t('battle.noEffect'));
                         audio.playSound(SOUND_EFFECTS.HIT);
                      }
                      applyMoveEffect(ctx, attacker, defender, move, damage);
                   }

                   setTimeout(() => {
                     if (defender.hp <= 0) ctx.fsm.transition(GAME_STATES.BATTLE_VICTORY);
                     else if (ctx.session.battle.type === BATTLE_TYPES.TRAINER) ctx.fsm.transition(GAME_STATES.BATTLE_ENEMY_SPELLING);
                     else ctx.fsm.transition(GAME_STATES.BATTLE_ENEMY_TURN);
                   }, 1000);
                }
              },
              [s(GAME_STATES.BATTLE_ENEMY_SPELLING)]: {
                onEnter: (ctx) => {
                  const wordObj = ctx.vocab.getRandomWord(ctx.session.player.currentArea, ctx.settings.locale, ctx.session);
                  ctx.session.battle.currentWord = wordObj;

                  const performance = getAISpellingPerformance();

                  // Delay for the animation to play
                  setTimeout(() => {
                    ctx.fsm.send(GAME_EVENTS.AI_SUBMIT, performance);
                  }, ANIMATION_DURATIONS.AI_SPELLING_DURATION_MS);
                },
                on: {
                  [GAME_EVENTS.AI_SUBMIT]: (ctx, params) => {
                    // AI word is 'seen'
                    ctx.session.recordWord(ctx.session.player.currentArea, ctx.session.battle.currentWord!.word, 'seen');
                    return {
                      target: GAME_STATES.BATTLE_ENEMY_TURN,
                      params
                    };
                  }
                }
              },
              [s(GAME_STATES.BATTLE_ENEMY_TURN)]: {
                onEnter: async (ctx) => {
                   const enemyMon = ctx.session.battle.enemyMon!;
                   const playerMon = ctx.session.activePlayerMon!;

                   if (enemyMon.confusionTurns) {
                      enemyMon.confusionTurns--;
                      if (enemyMon.confusionTurns <= 0) {
                         ctx.session.battle.log.push(ctx.t('battle.outOfConfusion', { name: ctx.t('monsters.' + enemyMon.species) }));
                      } else {
                         ctx.session.battle.log.push(ctx.t('battle.isConfused', { name: ctx.t('monsters.' + enemyMon.species) }));
                         if (Math.random() < 0.5) {
                            const confusionMove: Move = { id: 'confusion_self', name: 'Confusion', type: 'Normal', category: 'Physical', power: 40, accuracy: 100 };
                            const { damage } = calculateDamage(enemyMon, enemyMon, confusionMove, { isCorrect: true, isPerfect: false, isPower: false });
                            enemyMon.hp = Math.max(0, enemyMon.hp - damage);
                            ctx.session.battle.log.push(ctx.t('battle.hurtSelf'));
                            audio.playSound(SOUND_EFFECTS.HIT);
                            setTimeout(() => {
                               if (enemyMon.hp <= 0) ctx.fsm.transition(GAME_STATES.BATTLE_VICTORY);
                               else ctx.fsm.transition(GAME_STATES.BATTLE_ACTION_SELECT);
                            }, 1000);
                            return;
                         }
                      }
                   }

                   // End of turn damage
                   for (const m of [playerMon, enemyMon]) {
                      if (m.hp > 0 && (m.status === STATUS_CONDITIONS.POISON || m.status === STATUS_CONDITIONS.BURN)) {
                         const dmg = Math.max(1, Math.floor(m.maxHp / 8));
                         m.hp = Math.max(0, m.hp - dmg);
                         ctx.session.battle.log.push(ctx.t('battle.statusDamage', { name: ctx.t('monsters.' + m.species), status: ctx.t('battle.status.' + m.status.toLowerCase()) }));
                      }
                   }

                   if (enemyMon.hp <= 0) {
                      setTimeout(() => ctx.fsm.transition(GAME_STATES.BATTLE_VICTORY), 500);
                      return;
                   }
                   if (playerMon.hp <= 0) {
                      setTimeout(() => {
                         ctx.session.battle.log.push(ctx.t('battle.lose', { name: ctx.t('monsters.' + playerMon.species) }));
                         if (ctx.session.player.party.some((m: Monster) => m.hp > 0)) {
                           ctx.fsm.transition(GAME_STATES.BATTLE_SWITCHING);
                         } else {
                           ctx.fsm.transition(GAME_STATES.BATTLE_WHITED_OUT);
                         }
                      }, 1000);
                      return;
                   }

                   if (enemyMon.status === STATUS_CONDITIONS.SLEEP) {
                      enemyMon.statusTurns = (enemyMon.statusTurns || 0) - 1;
                      if (enemyMon.statusTurns <= 0) {
                         enemyMon.status = STATUS_CONDITIONS.NONE;
                         ctx.session.battle.log.push(ctx.t('battle.wokeUp', { name: ctx.t('monsters.' + enemyMon.species) }));
                      } else {
                         ctx.session.battle.log.push(ctx.t('battle.isAsleep', { name: ctx.t('monsters.' + enemyMon.species) }));
                         setTimeout(() => ctx.fsm.transition(GAME_STATES.BATTLE_ACTION_SELECT), 1000);
                         return;
                      }
                   }
                   if (enemyMon.status === STATUS_CONDITIONS.FREEZE) {
                      ctx.session.battle.log.push(ctx.t('battle.isFrozen', { name: ctx.t('monsters.' + enemyMon.species) }));
                      setTimeout(() => ctx.fsm.transition(GAME_STATES.BATTLE_ACTION_SELECT), 1000);
                      return;
                   }
                   if (enemyMon.status === STATUS_CONDITIONS.PARALYSIS && Math.random() < 0.25) {
                      ctx.session.battle.log.push(ctx.t('battle.isParalyzed', { name: ctx.t('monsters.' + enemyMon.species) }));
                      setTimeout(() => ctx.fsm.transition(GAME_STATES.BATTLE_ACTION_SELECT), 1000);
                      return;
                   }

                   // AI: Pick a random move
                   const moveId = enemyMon.moves[Math.floor(Math.random() * enemyMon.moves.length)] || MOVE_IDS.Tackle;
                   const move = MOVES[moveId];

                   ctx.session.battle.log.push(ctx.t('battle.usedMove', { mon: ctx.t('monsters.' + enemyMon.species), move: ctx.t('moves.' + move.id) }));

                   const performance = params.isCorrect !== undefined ? params : { isCorrect: true, isPerfect: false, isPower: false };
                   const { damage, typeMod, isMiss } = calculateDamage(enemyMon, playerMon, move, performance);

                   if (isMiss) {
                      ctx.session.battle.log.push(ctx.t('battle.missed'));
                   } else {
                      if (damage > 0) {
                         ctx.session.damagePlayerMon(damage);
                         ctx.session.battle.log.push(ctx.t('battle.dealtDamage', { amount: damage }));
                         if (typeMod > 1) ctx.session.battle.log.push(ctx.t('battle.superEffective'));
                         if (typeMod < 1 && typeMod > 0) ctx.session.battle.log.push(ctx.t('battle.notVeryEffective'));
                         if (typeMod === 0) ctx.session.battle.log.push(ctx.t('battle.noEffect'));
                         audio.playSound(SOUND_EFFECTS.HIT);
                      }
                      applyMoveEffect(ctx, enemyMon, playerMon, move, damage);
                   }

                   setTimeout(() => {
                     if (playerMon.hp <= 0) {
                        ctx.session.battle.log.push(ctx.t('battle.lose', { name: ctx.t('monsters.' + playerMon.species) }));
                        if (ctx.session.player.party.some((m: Monster) => m.hp > 0)) {
                          ctx.fsm.transition(GAME_STATES.BATTLE_SWITCHING);
                        } else {
                          if (ctx.session.battle.type === BATTLE_TYPES.TRAINER) {
                            ctx.session.battle.log.push(ctx.t('battle.trainer_victory_quote'));
                          }
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
                    // Check both the battle state flag and the trainerId for robustness
                    if (ctx.session.battle.isRival || ctx.session.battle.trainerId?.startsWith('rival_')) {
                      if (ctx.session.battle.trainerId) {
                        ctx.session.recordTrainerDefeat(ctx.session.battle.trainerId);
                      }
                      ctx.session.healParty();
                      ctx.session.notify(ctx.t('npc.rival.mercy'));
                      return GAME_STATES.WORLD;
                    }
                    ctx.session.healParty();
                    if (ctx.session.player.lastSpellCenter) {
                       ctx.session.updatePlayerPosition({ x: ctx.session.player.lastSpellCenter.x, y: ctx.session.player.lastSpellCenter.y });
                       ctx.session.player.currentInterior = ctx.session.player.lastSpellCenter.interior;
                    } else {
                       // Fallback to Home Bed
                       ctx.session.updatePlayerPosition({ x: SPAWN_POINTS.HOME.x, y: SPAWN_POINTS.HOME.y });
                       ctx.session.player.currentInterior = SPAWN_POINTS.HOME.interior;
                    }
                    return GAME_STATES.WORLD;
                  }
                }
              },
              [s(GAME_STATES.BATTLE_VICTORY)]: {
                onEnter: async (ctx) => {
                  ctx.session.battle.log.push(ctx.t('battle.win', { name: ctx.t('monsters.' + ctx.session.battle.enemyMon.species) }));
                  audio.playSound(SOUND_EFFECTS.VICTORY);

                  // WE REMOVED recordTrainerDefeat HERE so it happens after dialog

                  const exp = calculateExpGain(ctx.session.battle.enemyMon, ctx.session.battle.type === BATTLE_TYPES.TRAINER);
                  ctx.session.battle.results = ctx.session.awardExp(exp);
                  setTimeout(() => ctx.fsm.transition(GAME_STATES.BATTLE_RESULTS), 2000);
                }
              },
              [s(GAME_STATES.BATTLE_RESULTS)]: {
                onEnter: (ctx) => {
                  if (ctx.session.battle.trainerId?.startsWith('gym_boss_')) {
                    const area = parseInt(ctx.session.battle.trainerId.split('_')[2]);
                    ctx.session.awardBadge(`badge_${area}`);
                    if (!ctx.session.player.unlockedAreas.includes(area + 1)) {
                       ctx.session.player.unlockedAreas.push(area + 1);
                    }
                    ctx.session.save();
                  }
                },
                on: {
                  [GAME_EVENTS.CONTINUE]: (ctx) => {
                    if (ctx.session.battle.type === BATTLE_TYPES.TRAINER) {
                      const trainerId = ctx.session.battle.trainerId;
                      let defeatMsg = '';
                      let trainerName = trainerId || 'Trainer';
                      if (ctx.session.battle.isRival) {
                        defeatMsg = ctx.t('npc.rival.defeat');
                        trainerName = ctx.t('npc.rival.name');
                      } else if (ctx.session.battle.trainerDefeatDialog) {
                        defeatMsg = ctx.t(ctx.session.battle.trainerDefeatDialog);
                        // Try to find a better name if possible
                        const trainer = ctx.map.currentMapData?.trainers.find(t => t.id === ctx.session.battle.trainerId);
                        if (trainer) {
                           trainerName = trainer.name;
                           if (trainerName.includes('::')) {
                             const [key, raw] = trainerName.split('::');
                             trainerName = `${ctx.t(key)} ${raw}`;
                           } else if (trainerName.startsWith('npc.') || trainerName.startsWith('trainer.')) {
                             trainerName = ctx.t(trainerName);
                           }
                        }
                      }

                      if (defeatMsg) {
                        const lines = [defeatMsg];
                        if (ctx.session.battle.isStorm) {
                          lines.push(`"${ctx.t('trainer.dialogs.storm_catchphrase')}"`);
                        }

                        return {
                           target: GAME_STATES.DIALOG,
                           params: {
                             onEnter: () => {
                               ctx.session.showDialog(lines, trainerName);
                             },
                             onComplete: () => {
                               // Signal for fleeing to happen AFTER dialog
                               if (trainerId) ctx.session.recordTrainerDefeat(trainerId);
                             }
                           }
                        };
                      }

                      // Fallback: Always record defeat for trainer battles even if no dialog
                      if (trainerId) ctx.session.recordTrainerDefeat(trainerId);
                    }
                    return GAME_STATES.WORLD;
                  }
                }
              },
              [s(GAME_STATES.BATTLE_PARTY_FULL)]: {
                on: {
                  [GAME_EVENTS.REPLACE]: (ctx, params) => {
                    const index = ctx.session.player.party.findIndex((m: Monster) => m.id === params.replaceMonId);
                    if (index !== -1 && ctx.session.battle.enemyMon) {
                      ctx.session.player.party[index] = { ...ctx.session.battle.enemyMon };
                      ctx.session.save();
                    }
                    return GAME_STATES.WORLD;
                  },
                  [GAME_EVENTS.RELEASE]: (ctx) => {
                    if (ctx.session.battle.enemyMon) {
                      ctx.session.notify(ctx.t('battle.releasedWild', { name: ctx.t('monsters.' + ctx.session.battle.enemyMon.species) }));
                    }
                    return GAME_STATES.WORLD;
                  }
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

  const dismiss = () => {
    if (fsm.matches(GAME_STATES.DIALOG)) {
      fsm.send(GAME_EVENTS.CONFIRM);
    } else if (session.notification) {
      session.clearNotification();
    }
  };

  return {
    state: fsm.state,
    params: currentParams,
    send: fsm.send,
    transition: fsm.transition,
    matches: fsm.matches,
    dismiss
  };
});
