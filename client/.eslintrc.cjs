module.exports = {
  root: true,
  env: { browser: true, es2022: true },
  parserOptions: { ecmaVersion: "latest", sourceType: "module", ecmaFeatures: { jsx: true } },
  settings: { react: { version: "18.3" } },
  extends: ["eslint:recommended", "plugin:react/recommended", "plugin:react/jsx-runtime", "plugin:react-hooks/recommended"],
  plugins: ["react", "react-hooks"],
  ignorePatterns: ["dist", "node_modules"],
  rules: {
    "react/prop-types": "off",
    "react/no-unescaped-entities": "off",
    "no-unused-vars": ["warn", { varsIgnorePattern: "^[A-Z_]", argsIgnorePattern: "^_" }],
  },
};
