import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [
      ".next/**",
      "logs/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**"
    ]
  }
];

export default config;
