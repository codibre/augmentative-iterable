module.exports = {
  extends: require.resolve('@codibre/confs/.eslintrc.js'),
  rules: {
    'default-case': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'no-magic-numbers': 'off'
  }
}
