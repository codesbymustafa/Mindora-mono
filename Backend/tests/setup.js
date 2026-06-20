// Set test environment variable
import {jest , afterAll ,beforeAll } from "@jest/globals";
import mongoose from "mongoose";
import { DB_NAME } from "../src/constants.js";

process.env.NODE_ENV = "TEST";

// Set required environment variables for testing
process.env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "test-access-token-secret-key";
process.env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "test-refresh-token-secret-key";
process.env.ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "1d";
process.env.REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || "*";

// Increase Jest timeout for database operations
jest.setTimeout(30000);

beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI + "/" + DB_NAME + "_test" ;
    await mongoose.connect(mongoUri);
    // console.log("Connected to test database");
});

afterAll(async () => {
    // Clean up and close connection
    await mongoose.connection.close();
});