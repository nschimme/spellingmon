# Spellingmon Architecture

This project uses a **Separation of Concerns** architecture driven by a **Hierarchical Finite State Machine (HFSM)**.

## Core Pillars

### 1. The Brain: HFSM (`src/stores/gameFSM.js`)
- All business logic, flow control, and side effects (audio, timers, vocab loading) live here.
- The FSM is reactive and uses the lightweight engine in `src/utils/fsm.js`.
- **States** define what mode the game is in (e.g., `PLAY.WORLD`, `PLAY.BATTLE.SPELLING`).
- **Transitions** are the only way to change states, ensuring side effects are handled predictably.
- **Events** are sent to the machine via `fsm.send(GAME_EVENTS.XYZ)`.

### 2. The Body: Session Store (`src/stores/sessionStore.js`)
- Pure data storage for the current game session (Player stats, Party, Map discovery, Battle status).
- Handles disk persistence (`localStorage`) into a unified JSON object per slot.
- Does NOT contain business logic or flow control. It only provides mutation methods (e.g., `damageEnemy`, `updatePosition`).

### 3. The Face: Components (`src/components/`)
- "Thin" UI layers that subscribe to FSM state and Session data.
- They emit **Events** to the FSM (using `GAME_EVENTS` constants) instead of modifying state directly.
- Use `fsm.matches(GAME_STATES.XYZ)` to conditionally render UI elements.

## Hierarchy Tree

```
ROOT
├── BOOTING
├── LANGUAGE_SELECT
├── TTS_CHECK
├── LANDING
├── SAVE_SELECTION
├── ONBOARDING
│   ├── CHARACTER_CREATION
│   └── STARTER_SELECTION
└── PLAY
    ├── WORLD (Includes Interiors)
    ├── TRAINER_APPROACH
    ├── BATTLE
    │   ├── INTRO
    │   ├── ACTION_SELECT
    │   ├── SWITCHING
    │   ├── SPELLING
    │   ├── PLAYER_ATTACK
    │   ├── ENEMY_TURN
    │   ├── WHITED_OUT
    │   ├── VICTORY
    │   ├── RESULTS
    │   └── PARTY_FULL
    ├── MENU
    ├── EVOLUTION
    └── STORY_CUTSCENE
```

## Best Practices

### Use Constants
Always use `GAME_STATES` and `GAME_EVENTS` from `src/utils/constants.js`.
```javascript
// Good
fsm.send(GAME_EVENTS.ATTACK);
if (fsm.matches(GAME_STATES.BATTLE_SPELLING)) { ... }

// Bad
fsm.send('ATTACK');
if (fsm.state.value === 'PLAY.BATTLE.SPELLING') { ... }
```

## Interior System
Interiors (Home, Gyms, Spelling Centers) are defined as sub-maps within `MapGenerator.ts`. The `WorldMap.vue` component dynamically switches between rendering the world map and the current interior based on `session.player.currentInterior`.

## Adding a Feature

1. **Data:** Add any new persistent fields to `sessionStore.js`.
2. **Logic:** Add new states or transition handlers to `gameFSM.js`.
3. **UI:** Create/Update components to react to the new FSM state and send appropriate events.
