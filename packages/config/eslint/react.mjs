import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

import base from './base.mjs'

export default [
  ...base,
  reactHooks.configs.flat['recommended-latest'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2022 },
    },
  },
]
