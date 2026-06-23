# Instructions for AI Agents

You are working on a game engine built with Vue 3, Pinia, and a custom HFSM. To maintain the stability and extensibility of this project, you MUST follow these rules:

## 1. Do Not Bypass the FSM
- Never use local `ref` booleans for major state transitions (e.g., `isBattleOpen = true`).
- Always define a state in `src/stores/gameFSM.js` and use `fsm.transition()` or `fsm.send()`.
- Use `fsm.matches(GAME_STATES.XYZ)` in components to determine visibility.
- **Never use magic strings** for events or states; always use the `GAME_EVENTS` and `GAME_STATES` constants from `src/utils/constants.js`.

## 2. Keep Stores "Dumb"
- Stores (like `sessionStore.js`) should only contain data and simple mutation functions.
- If a mutation has a side effect (like playing a sound or moving to a new screen), that logic belongs in the **FSM**, not the store.

## 3. Persistent State vs. Transient State
- If a value needs to survive a browser refresh (HP, Gold, Position), put it in `sessionStore.js`.
- If a value is only for the current animation or UI interaction (timer remaining, current input string), keep it in the component.

## 4. Hierarchical States
- Leverage the hierarchy! If you are adding a sub-mode to the Battle, add it as a child state of `PLAY.BATTLE`. This ensures that parent `onExit` hooks (like cleaning up battle music) still run correctly.

## 5. Event-Driven Transitions
- Favor `fsm.send(GAME_EVENTS.EVENT_NAME)` over direct `fsm.transition()`. This allows the FSM to decide how to handle the event based on the current state, preventing "impossible" transitions.

## 6. Documentation
- If you change the state tree or the session data structure, you MUST update `docs/architecture.md`.

## 7. Internationalization (i18n)
- When adding new UI text, you MUST add it to `src/i18n/locales/en-US.json`.
- After adding keys to `en-US.json`, run `node scripts/sync-i18n.cjs` to propagate those keys to all other locale files. This is required to pass the `lint` check in CI.
- Avoid using dynamic strings that the i18n checker cannot find via `grep`. If you must use dynamic keys, add them to the `dynamicPrefixes` list in `scripts/check-i18n.cjs`.

## 8. Code Style & CI
- Always use `const` for variables that are not reassigned. The CI will fail on `let` variables that should be `const`.
- Ensure all imports are used. Unused imports will cause linting failures.
- When working with the FSM, ensure transitions are handled via `fsm.send` where possible, and avoid manual state assignments unless necessary for complex routing.
