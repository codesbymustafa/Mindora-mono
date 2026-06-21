import { defineConfig } from "cypress";

export default defineConfig({
    e2e: {
        // The Vite dev server. Cypress drives a real browser against it.
        baseUrl: "http://localhost:5173",
        // Backend API base, reachable via the Vite dev-server proxy (/api -> :3000).
        env: {
            apiUrl: "/api/v1",
        },
        supportFile: "cypress/support/e2e.js",
        specPattern: "cypress/e2e/**/*.cy.js",
    },
});
