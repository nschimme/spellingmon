import js from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        defineProps: 'readonly',
        defineEmits: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
      }
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'no-undef': 'error',
      'no-unused-vars': 'warn',
      'no-useless-assignment': 'off',
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'public/sw.js']
  }
];
