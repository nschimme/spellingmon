# Gameplay Mechanics

## Core Loop

1. **Exploration:** Navigate a top-down grid world divided into distinct geographic Areas. Encounter wild Spellingmon in tall grass or challenge NPC trainers.
2. **The Spelling Battle:** Turn-based combat where "attacks" are powered by spelling.
   - **The Prompt:** Listen to vocal audio hints and optional context sentences.
   - **Single-Chance Rule:** You have one attempt to submit the correct spelling.
   - **Rewards:** Correct spelling deals damage or captures wild monsters. "Perfect" spelling (matching case and diacritics) provides a power bonus.
3. **Growth:** Gain experience, level up, and evolve your Spellingmon.
4. **The SpellCenter:** Heal your party and set a respawn point.

## Spelling System

- **Normalization:** By default, spelling checks are case-insensitive and ignore diacritics for accessibility.
- **Perfect Hits:** Awarded for exact matches (including casing and diacritics) only if the target word contains them.
- **Speed Bonus:** Submitting a correct answer in the first half of the timer deals increased damage.
- **Difficulty Tiers:** Damage scales based on word difficulty (Easy/Hard) and player performance (Fast/Perfect).

## Vocabulary & Areas

The game world is divided into 9 areas, each focusing on specific linguistic patterns:

| Area | Focus |
| --- | --- |
| 1. Alphabet Avenue | Short vowels, basic CVC words. |
| 2. Blend Boulevard | Consonant blends and digraphs. |
| 3. Syllable Springs | Compound words and multi-syllables. |
| 4. Suffix Summit | Suffix spelling rules. |
| 5. Prefix Peak | Common prefixes and silent letters. |
| 6. Homophone Harbor | Homophones (context-dependent). |
| 7. Loanword Labyrinth | Words adopted from other languages. |
| 8. Phoneme Forest | Vowel blends and spelling traps. |
| 9. Etymology Elite | Latin/Greek roots and advanced vocabulary. |

## Internationalization (i18n)

Spellingmon supports multiple languages including English, German, Spanish, French, Portuguese, Russian, and Mandarin Pinyin.
- UI strings are fully localized via `vue-i18n`.
- Vocabulary is loaded dynamically based on the selected locale from `public/vocab/{locale}/area{N}.json`.
- The game leverages the browser's native **Web Speech API** to provide localized pronunciations without requiring external audio assets.
