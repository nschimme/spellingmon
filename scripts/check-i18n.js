#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const localesDir = 'src/i18n/locales';
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const referenceFile = 'en-US.json';
const referenceData = JSON.parse(fs.readFileSync(path.join(localesDir, referenceFile), 'utf8'));

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getKeys(obj[key], `${prefix}${key}.`));
    } else {
      keys.push(`${prefix}${key}`);
    }
  }
  return keys;
}

const referenceKeys = getKeys(referenceData).sort();
let hasErrors = false;

console.log(`Checking ${files.length} locales against ${referenceFile}...\n`);

files.forEach(file => {
  if (file === referenceFile) return;

  const data = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf8'));
  const keys = getKeys(data);

  const missing = referenceKeys.filter(k => !keys.includes(k));
  const extra = keys.filter(k => !referenceKeys.includes(k));

  if (missing.length > 0 || extra.length > 0) {
    console.log(`[${file}]`);
    if (missing.length > 0) {
      console.log(`  Missing keys (${missing.length}):`);
      missing.forEach(k => console.log(`    - ${k}`));
    }
    if (extra.length > 0) {
      console.log(`  Extra keys (${extra.length}):`);
      extra.forEach(k => console.log(`    + ${k}`));
    }
    console.log('');
    hasErrors = true;
  }
});

if (!hasErrors) {
  console.log('✅ All locales are in sync!');
  process.exit(0);
} else {
  process.exit(1);
}
