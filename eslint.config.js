import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'public',
      'data',
      '_yedek',
      'graphify-out',
      'obsidian',
      'tanitim',
      'agents',
      'context',
    ],
  },
  // Browser app (React)
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  // Node: API server, scripts, config files
  {
    files: ['server/**/*.{ts,js,mjs}', 'scripts/**/*.{ts,js,mjs}', '*.{ts,js,mjs}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
    },
  },
  // Shared rule tuning
  {
    rules: {
      // `_name` marks an intentionally unused binding (e.g. `{ secret: _s, ...rest }` to strip a field).
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      // `try { localStorage... } catch {}` is a deliberate best-effort pattern.
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    files: ['server/**/*.ts'],
    rules: {
      // Input sanitizers intentionally strip control characters (\x00-\x1f).
      'no-control-regex': 'off',
      // Server parses untrusted JSON / LLM output and SDK responses, then normalizes field by field.
      // server/ is not covered by either tsconfig yet; tighten this once it is type-checked.
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  {
    // `declare global { var x: T }` requires `var`.
    files: ['**/*.d.ts'],
    rules: { 'no-var': 'off' },
  },
)
