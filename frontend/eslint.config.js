// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    // Generated from api/openapi.yaml
    ignores: ['src/app/api/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'kn',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'kn',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {
      // PLT-10: every user-visible text and attribute in templates is marked for translation.
      '@angular-eslint/template/i18n': [
        'error',
        {
          checkId: true,
          checkText: true,
          checkAttributes: true,
          ignoreAttributes: [
            'type',
            'method',
            'action',
            'name',
            'value',
            'autocomplete',
            'routerLink',
            'data-testid',
          ],
        },
      ],
    },
  },
  {
    // Not a component template: Angular i18n cannot translate it; the app sets the title at runtime.
    files: ['src/index.html'],
    rules: { '@angular-eslint/template/i18n': 'off' },
  },
]);
