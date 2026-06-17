# Spellingmon 🐉 📝

Welcome to **Spellingmon**, an open-source, educational role-playing game (RPG) built for kids! Heavily inspired by classic monster-collection games, Spellingmon swaps out traditional elemental battles for spelling proficiency.

Instead of fighting, players progress through a vibrant 2D world by learning, listening, and typing. To defeat opponents and catch wild Spellingmon, players must listen to vocal audio hints and correctly spell words on their first attempt!

## 🚀 Quick Start (Local Development)

```bash
npm install
npm run dev
```

Then open http://localhost:5173 in your browser.

---

## 🏗️ Technical Architecture

Spellingmon uses a modern **Hierarchical Finite State Machine (HFSM)** architecture to ensure a stable and bug-free gameplay experience.

* **The Brain:** A reactive HFSM (`src/stores/gameFSM.js`) manages all game logic and transitions.
* **The Body:** A unified Session Store (`src/stores/sessionStore.js`) handles all persistent data and slot-based storage.
* **The Face:** Thin UI components built with **Vue 3** that react to the state machine.
* **Audio Pipeline:** Zero-setup TTS powered by the browser's native **Web Speech API**.

For a deep dive into the architecture, see [docs/architecture.md](docs/architecture.md).

---

## 📖 Learn More

- **[Gameplay Mechanics](docs/gameplay.md):** Details on the core loop, spelling rules, and area progression.
- **[Developer Guidelines](AGENTS.md):** Essential rules for maintaining the FSM and stores.
- **[Vocabulary Extension](docs/gameplay.md#vocabulary--areas):** How the 9 areas are structured.

---

## 🛠️ How to Extend

Spellingmon is designed to be easy to customize. Vocabulary packs live inside `public/vocab/{locale}/area{N}.json`.

```json
[
  {
    "id": "w_area4_pharaoh",
    "word": "Pharaoh",
    "definition": "A ruler in ancient Egypt.",
    "sentence_context": "The pharaoh commanded the construction of the pyramid.",
    "spoken_version": "Fair oh"
  }
]
```

- `"word"`: The target string for the player.
- `"spoken_version"` (Optional): Custom phonetic reading for the TTS engine.

---

## 🤖 CI/CD

Automated **GitHub Actions** validate vocabulary files, run E2E tests, and deploy the production build to **GitHub Pages** on every push to `main`.
