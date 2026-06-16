const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/i18n/locales');
const baseLocaleFile = 'en-US.json';
const baseLocalePath = path.join(localesDir, baseLocaleFile);
const baseLocale = JSON.parse(fs.readFileSync(baseLocalePath, 'utf8'));

const localeFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== baseLocaleFile);

const merge = (target, source) => {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      merge(target[key], source[key]);
    } else {
      if (target[key] === undefined) {
        target[key] = source[key];
      }
    }
  }
};

localeFiles.forEach(file => {
  const localePath = path.join(localesDir, file);
  const locale = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  merge(locale, baseLocale);
  fs.writeFileSync(localePath, JSON.stringify(locale, null, 2) + '\n');
  console.log(`Synced ${file}`);
});
