import json
import os

locales = ['de-DE', 'es-MX', 'fr-FR', 'pt-BR', 'ru-RU', 'zh-CN', 'ja-JP']

translations = {
    'de-DE': {
        "usedMove": "{mon} setzt {move} ein!",
        "notVeryEffective": "Das ist nicht sehr effektiv...",
        "missed": "Die Attacke ging daneben!",
        "learnedMove": "{name} hat {move} gelernt!",
        "learnMovePrompt": "Soll {move} gelernt werden?"
    },
    'es-MX': {
        "usedMove": "¡{mon} usó {move}!",
        "notVeryEffective": "No es muy efectivo...",
        "missed": "¡El ataque falló!",
        "learnedMove": "¡{name} aprendió {move}!",
        "learnMovePrompt": "¿Aprender {move}?"
    },
    'fr-FR': {
        "usedMove": "{mon} utilise {move} !",
        "notVeryEffective": "Ce n'est pas très efficace...",
        "missed": "L'attaque a échoué !",
        "learnedMove": "{name} a appris {move} !",
        "learnMovePrompt": "Apprendre {move} ?"
    },
    'pt-BR': {
        "usedMove": "{mon} usou {move}!",
        "notVeryEffective": "Não é muito eficaz...",
        "missed": "O ataque falhou!",
        "learnedMove": "{name} aprendeu {move}!",
        "learnMovePrompt": "Aprender {move}?"
    },
    'ru-RU': {
        "usedMove": "{mon} использует {move}!",
        "notVeryEffective": "Это не очень эффективно...",
        "missed": "Атака промахнулась!",
        "learnedMove": "{name} выучил {move}!",
        "learnMovePrompt": "Выучить {move}?"
    },
    'zh-CN': {
        "usedMove": "{mon}使用了{move}！",
        "notVeryEffective": "效果不理想……",
        "missed": "攻击没有命中！",
        "learnedMove": "{name}学会了{move}！",
        "learnMovePrompt": "要学习{move}吗？"
    },
    'ja-JP': {
        "usedMove": "{mon}の {move}！",
        "notVeryEffective": "こうかは いまひとつの ようだ……",
        "missed": "こうげきは はずれた！",
        "learnedMove": "{name}は {move}を おぼえた！",
        "learnMovePrompt": "{move}を おぼえますか？"
    }
}

for locale in locales:
    filepath = f'src/i18n/locales/{locale}.json'
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if 'battle' in data:
            for key, translation in translations[locale].items():
                data['battle'][key] = translation

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.write('\n')
