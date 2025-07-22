import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    specPattern: '__tests__/e2e/**/*.cy.{ts,tsx}',
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/e2e.ts',
  },
});
