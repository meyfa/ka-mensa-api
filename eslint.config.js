import eslintConfig from '@meyfa/eslint-config'
import eslintConfigJsdoc from '@meyfa/eslint-config/jsdoc'

export default [
  ...eslintConfig,
  {
    ignores: [
      'dist',
      '.idea',
      '.vscode',
      'coverage',
      'cache'
    ]
  },
  {
    ...eslintConfigJsdoc,
    files: ['src/**/*.ts']
  }
]
