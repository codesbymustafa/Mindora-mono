// Set test environment variable
import {jest , afterAll} from "@jest/globals";

process.env.NODE_ENV = "TEST";

// Set required environment variables for testing
process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "test-access-token-secret-key";
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "test-refresh-token-secret-key";
process.env.ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "1d";
process.env.REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Increase Jest timeout for database operations
jest.setTimeout(30000);

// Global teardown
afterAll(async () => {
    // Add any global cleanup here if needed
    process.env.NODE_ENV = "DEVELOPMENT";
});
