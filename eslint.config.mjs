import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  prettier,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Indentación 2 espacios
      'indent': ['error', 2, { SwitchCase: 1 }],

      // Punto y coma siempre
      'semi': ['error', 'always'],

      // Comillas simples
      'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],

      // Comas al final
      'comma-dangle': ['error', 'always-multiline'],

      // Sin variables sin usar
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],

      // Permite any
      '@typescript-eslint/no-explicit-any': 'off',

      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // React Refresh
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // Líneas vacías máx 1
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],

      // Sin trailing spaces
      'no-trailing-spaces': 'error',

      // Llaves en misma línea
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],

      // Espacios
      'space-before-blocks': 'error',
      'keyword-spacing': 'error',

      // Max largo de línea
      'max-len': ['warn', { code: 120, ignoreStrings: true, ignoreTemplateLiterals: true, ignoreComments: true, ignorePattern: 'className=' }],

      // Sin console.log
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    ignores: ['dist/', 'node_modules/', '*.js', '*.mjs'],
  },
);