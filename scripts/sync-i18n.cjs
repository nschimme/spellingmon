const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/i18n/locales');
const baseLocaleFile = 'en-US.json';

const baseLocalePath = path.join(localesDir, baseLocaleFile);
const baseLocale = JSON.parse(fs.readFileSync(baseLocalePath, 'utf8'));

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      if (target[key] === undefined) {
        target[key] = source[key];
      }
    }
  }
}

const localeFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== baseLocaleFile);

localeFiles.forEach(file => {
  const localePath = path.join(localesDir, file);
  const locale = JSON.parse(fs.readFileSync(localePath, 'utf8'));

  deepMerge(locale, baseLocale);

  fs.writeFileSync(localePath, JSON.stringify(locale, null, 2) + '\n');
  console.log(`Synced ${file}`);
});
