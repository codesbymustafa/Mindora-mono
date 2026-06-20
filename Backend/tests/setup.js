// Global Jest test setup.
// Spins up an in-memory MongoDB so the suite runs fully isolated,
// with no external database and no MONGODB_URI required (works in CI).
import { jest, afterAll, beforeAll, afterEach } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

process.env.NODE_ENV = "TEST";

// Required env vars for the app under test (use safe test-only defaults).
process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "test-access-token-secret-key";
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "test-refresh-token-secret-key";
process.env.ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "1d";
process.env.REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

jest.setTimeout(30000);

let mongoServer;

beforeAll(async () => {
    // Boot a throwaway MongoDB that lives entirely in memory.
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
    // Wipe every collection between tests so each test starts from a clean slate.
    const { collections } = mongoose.connection;
    await Promise.all(
        Object.values(collections).map((collection) => collection.deleteMany({})),
    );
});

afterAll(async () => {
    // Tear down the connection and stop the in-memory server.
    await mongoose.disconnect();
    if (mongoServer) await mongoServer.stop();
});
