module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  plugins: ["testing-library"],
  overrides: [
    {
      files: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)"],
      extends: ["plugin:testing-library/react"],
    },
  ],
};
