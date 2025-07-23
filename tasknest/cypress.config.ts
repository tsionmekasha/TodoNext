const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: '{cypress/e2e,__tests__/e2e}/**/*.cy.{js,ts,jsx,tsx}',
    supportFile: false
  }
});