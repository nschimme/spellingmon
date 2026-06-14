# Spellingmon 🐉 📝

Welcome to **Spellingmon**, an open-source, educational role-playing game (RPG) built for kids! Heavily inspired by classic monster-collection games like Pokémon, Spellingmon swaps out traditional elemental battles for spelling proficiency.

Instead of fighting, players progress through a vibrant 2D world by learning, listening, and typing. To defeat opponents and catch wild Spellingmon, players must listen to vocal audio hints and correctly spell words on their very first attempt!

## 🚀 Quick Start (Local Development)

```bash
# One-command bootstrap (installs deps if needed and launches the dev server)
./bootstrap.sh

# Then open http://localhost:5173 in your browser.
```

Other options:

```bash
./bootstrap.sh --force     # Force fresh install of dependencies
./bootstrap.sh build       # Production build only (outputs to dist/)
./bootstrap.sh preview     # Build + local preview of the production bundle
./bootstrap.sh help
```

Or the classic npm commands:

```bash
npm install
npm run dev
```

See `bootstrap.sh` for the full launcher (handles Node checks, dependency installation, build, and preview).

---

## 🗺️ Core Game Loop

1. **Exploration:** Players navigate a top-down grid world divided into distinct geographic Areas (e.g., Alphabet Avenue, Prefix Peak). Moving through tall grass or talking to NPC trainers triggers a transitional battle scene.
2. **The Spelling Battle:** Combat is completely turn-based:
* **The Prompt:** The game plays a clear vocal audio hint of the target word.
* **The Single-Chance Rule:** The player has exactly **one try** to type and submit the correct spelling.
* **Success:** A correct spelling deals massive damage to the opponent or allows the player to capture a wild Spellingmon!
* **Failure:** An incorrect spelling results in a lost round, causing the player's active Spellingmon to take heavy damage or faint.


3. **The SpellCenter:** If all Spellingmon in a player's party faint, they return to the nearest SpellCenter to heal up and try again.

---

## 🚀 Technical Architecture

Spellingmon is built to be lightweight, easy to run, and highly accessible for contributors, teachers, and parents.

* **Frontend Framework:** Built as a modern Single Page Application (SPA) using **Vue 3 (Composition API)** and **Vite** for lightning-fast loading.
* **State Management:** Uses **Pinia** with cleanly separated stores (`usePlayerStore`, `useBattleStore`, `useVocabStore`) to keep the game's logic human-readable and easy to modify.
* **Zero-Setup Audio Pipeline:** Powered by the browser's native **Web Speech API (`SpeechSynthesis`)**. This means the game requires **no external servers, no API keys, and zero bulky audio asset downloads** to generate crystal-clear vocal hints.
* **Hosting & Infrastructure:** 100% serverless static asset compilation. It is designed to be hosted entirely for free on **GitHub Pages**.

---

## 📈 Area & Word Difficulty Setup

The game world's geography is directly tied to word complexity, allowing children to naturally level up their real-world spelling skills as they journey through the game:

| Area / Region | Target Levels | Word Difficulty / Linguistic Focus | Examples |
| --- | --- | --- | --- |
| **Area 1: Alphabet Avenue** | Levels 1–10 | Short vowels, basic 3-4 letter consonant-vowel-consonant (CVC) words. | *Cat, Jump, Frog, Desk* |
| **Area 2: Blend Boulevard** | Levels 11–18 | Consonant blends (bl, str), digraphs (ch, sh, th), and long vowel silent-e patterns. | *Brave, Shock, String, Whale* |
| **Area 3: Syllable Springs** | Levels 19–28 | Double consonants, compound words, basic multi-syllables. | *Sunlight, Written, Butter* |
| **Area 4: Suffix Summit** | Levels 29–38 | Suffix spelling rules (dropping 'e', changing 'y' to 'i', doubling consonants). | *Running, Happily, Baked, Crying* |
| **Area 5: Prefix Peak** | Levels 39–48 | Common prefixes/suffixes, silent letters, basic irregulars. | *Unhappy, Knight, Echoes* |
| **Area 6: Homophone Harbor** | Levels 49–58 | Words that sound alike but spell differently (relies heavily on context clues). | *Their/There/They're, Principal/Principle* |
| **Area 7: Loanword Labyrinth** | Levels 59–68 | Words adopted from other languages (French, Italian, Spanish) with unique phonetic rules. | *Chef, Bouquet, Garage, Patio* |
| **Area 8: Phoneme Forest** | Levels 69–80 | Homophones, complex vowel blends, and common spelling traps. | *Receive, Separate, Pharaoh* |
| **Area 9: Etymology Elite** | Levels 81+ | Advanced vocabulary, Latin/Greek roots, and obscure words. | *Conscientious, Onomatopoeia* |

---

## 🛠️ How to Extend & Add Custom Words

Spellingmon is designed to be incredibly easy to customize. Want to add a vocabulary list tailored to your child's weekly school spelling test? You just need to update a single, human-readable JSON file!

Vocabulary packs live inside the `public/vocab/` directory and follow this simple layout:

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

### Key Parameters:

* `"word"`: The exact string the child must type to win the round (case-insensitive).
* `"spoken_version"` *(Optional)*: If a word has tricky, non-phonetic rules (like *Pharaoh* or *Colonel*), you can add a `spoken_version`. The browser engine will read this text aloud instead, ensuring perfect pronunciation while keeping the required input text unaltered.

---

## 🤖 Continuous Integration & Deployment

The repository includes an automated **GitHub Actions** workflow. Every time code or new vocabulary lists are pushed to the `main` branch, the workflow will automatically:

1. Validate the formatting of your word JSON files.
2. Compile and optimize the static production code bundle via Vite.
3. Automatically deploy the updated game live to **GitHub Pages**.
