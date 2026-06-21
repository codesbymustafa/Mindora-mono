// Loaded automatically before every E2E spec.
// Place custom commands and global hooks here.

// A unique-ish suffix so reruns don't collide on unique fields (username/email).
Cypress.Commands.add("uniqueSuffix", () => Date.now().toString(36));
