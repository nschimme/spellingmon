const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const localesDir = path.join(__dirname, '../src/i18n/locales');
const srcDir = path.join(__dirname, '../src');
const baseLocaleFile = 'en-US.json';

const baseLocalePath = path.join(localesDir, baseLocaleFile);
const baseLocale = JSON.parse(fs.readFileSync(baseLocalePath, 'utf8'));

const getKeys = (obj, prefix = '') => {
  return Object.keys(obj).reduce((res, el) => {
    if (Array.isArray(obj[el])) {
      return res;
    } else if (typeof obj[el] === 'object' && obj[el] !== null) {
      return [...res, ...getKeys(obj[el], prefix + el + '.')];
    }
    return [...res, prefix + el];
  }, []);
};

const baseKeys = getKeys(baseLocale);
let hasError = false;

console.log('--- Checking for missing i18n keys ---');
const localeFiles = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== baseLocaleFile);

localeFiles.forEach(file => {
  const localePath = path.join(localesDir, file);
  const locale = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  const localeKeys = getKeys(locale);

  const missingKeys = baseKeys.filter(k => !localeKeys.includes(k));
  if (missingKeys.length > 0) {
    console.error(`❌ Locale ${file} is missing keys:`);
    missingKeys.forEach(k => console.error(`  - ${k}`));
    hasError = true;
  } else {
    console.log(`✅ ${file} is complete.`);
  }
});

console.log('\n--- Checking for unused i18n keys ---');
// Prefixes that we know are used dynamically
const dynamicPrefixes = ['monsters.', 'types.', 'menu.areaNames.'];

const unusedKeys = [];
baseKeys.forEach(key => {
  if (dynamicPrefixes.some(p => key.startsWith(p))) {
    return; // Skip dynamic keys
  }

  try {
    const escapedKey = key.replace(/\./g, '\\.');
    const result = execSync(`grep -r "${escapedKey}" ${srcDir} --exclude-dir=i18n/locales || true`).toString();
    if (!result.trim()) {
      unusedKeys.push(key);
    }
  } catch (e) {}
});

if (unusedKeys.length > 0) {
  console.warn('⚠️ Found potentially unused keys (Double check before deleting):');
  unusedKeys.forEach(k => console.warn(`  - ${k}`));
} else {
  console.log('✅ No unused keys found.');
}

if (hasError) {
  console.error('\n❌ i18n check failed due to missing keys.');
  process.exit(1);
} else {
  console.log('\n✅ i18n check passed.');
}
