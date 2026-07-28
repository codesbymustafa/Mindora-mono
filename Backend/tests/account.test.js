// Account lifecycle: token refresh, password change, watch history, and theme.
// These are the remaining uncovered branches in user.controller.js. They matter because
// they are the flows where auth state actually mutates.
import { describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { app } from "../src/app.js";
import { User } from "../src/models/user.model.js";
import { Video } from "../src/models/video.model.js";

let user;
let accessToken;
let video;

const tokenFor = (u) =>
    jwt.sign(
        { _id: u._id, email: u.email, username: u.username, fullName: u.fullName },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" },
    );

beforeEach(async () => {
    user = await User.create({
        username: "accountuser",
        email: "account@example.com",
        fullName: "Account User",
        avatar: "https://example.com/a.png",
        password: "password123",
    });
    accessToken = tokenFor(user);

    video = await Video.create({
        videoFile: "https://cdn.test/video.mp4",
        thumbnail: "https://cdn.test/thumb.jpg",
        title: "Watchable",
        description: "A video to watch",
        duration: 30,
        owner: user._id,
    });
});

// Mints a refresh token and stores it on the user the way loginUser would, so the
// refresh endpoint sees consistent state.
const issueRefreshToken = async (u) => {
    const refreshToken = u.generateRefreshToken();
    u.refreshToken = refreshToken;
    await u.save({ validateBeforeSave: false });
    return refreshToken;
};

describe("POST /api/v1/users/refresh-token", () => {
    it("returns 401 when no refresh token is supplied", async () => {
        const res = await request(app)
            .post("/api/v1/users/refresh-token")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(401);
    });

    it("returns 401 for a refresh token signed with the wrong secret", async () => {
        const forged = jwt.sign({ _id: user._id }, "wrong-secret", { expiresIn: "7d" });

        const res = await request(app)
            .post("/api/v1/users/refresh-token")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ refreshToken: forged });

        expect(res.status).toBe(401);
    });

    it("returns 401 for a valid token that no longer matches the one on the user", async () => {
        // A stale token: correctly signed and unexpired, but not the one currently stored.
        // Note generateRefreshToken() signs only { _id } plus iat/exp, so two calls in the
        // same second produce byte-identical strings -- the differing expiry below is what
        // makes these two tokens genuinely distinct.
        const stale = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "7d",
        });
        user.refreshToken = jwt.sign({ _id: user._id }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: "30d",
        });
        await user.save({ validateBeforeSave: false });
        expect(stale).not.toBe(user.refreshToken);

        const res = await request(app)
            .post("/api/v1/users/refresh-token")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ refreshToken: stale });

        expect(res.status).toBe(401);
    });

    it("issues a new access token for a valid refresh token", async () => {
        const refreshToken = await issueRefreshToken(user);

        const res = await request(app)
            .post("/api/v1/users/refresh-token")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ refreshToken });

        expect(res.status).toBe(200);
        expect(typeof res.body.data.accessToken).toBe("string");
        // The new access token must be usable.
        const verified = jwt.verify(
            res.body.data.accessToken,
            process.env.ACCESS_TOKEN_SECRET,
        );
        expect(verified._id).toBe(user._id.toString());
    });

    it("accepts the refresh token from a cookie as well as the body", async () => {
        const refreshToken = await issueRefreshToken(user);

        const res = await request(app)
            .post("/api/v1/users/refresh-token")
            .set("Authorization", `Bearer ${accessToken}`)
            .set("Cookie", [`refreshToken=${refreshToken}`]);

        expect(res.status).toBe(200);
    });

    // KNOWN BUG (user.controller.js:227). generateAccessAndRefreshToken returns
    // { accessToken, refreshToken }, but the caller destructures `newRefreshToken`,
    // which is therefore always undefined. The endpoint then sets the refreshToken
    // cookie to undefined and returns newRefreshToken: undefined, so the client never
    // receives a rotated refresh token -- silently defeating the rotation this endpoint
    // exists to perform. Renaming the destructured field fixes it.
    it.failing("returns a rotated refresh token", async () => {
        const refreshToken = await issueRefreshToken(user);

        const res = await request(app)
            .post("/api/v1/users/refresh-token")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ refreshToken });

        expect(res.status).toBe(200);
        expect(typeof res.body.data.newRefreshToken).toBe("string");
    });

    it("never returns the password hash alongside the refreshed user", async () => {
        const refreshToken = await issueRefreshToken(user);

        const res = await request(app)
            .post("/api/v1/users/refresh-token")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ refreshToken });

        expect(res.body.data.user.password).toBeUndefined();
    });
});

describe("POST /api/v1/users/change-password", () => {
    it("returns 400 when the old password is missing", async () => {
        const res = await request(app)
            .post("/api/v1/users/change-password")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ newPassword: "newpassword123" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("All fields are required");
    });

    it("returns 400 for a whitespace-only new password", async () => {
        const res = await request(app)
            .post("/api/v1/users/change-password")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ oldPassword: "password123", newPassword: "   " });

        expect(res.status).toBe(400);
    });

    it("returns 401 when the old password is wrong", async () => {
        const res = await request(app)
            .post("/api/v1/users/change-password")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ oldPassword: "definitely-wrong", newPassword: "newpassword123" });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe("Invalid credentials");
    });

    it("changes the password so the new one works and the old one does not", async () => {
        const change = await request(app)
            .post("/api/v1/users/change-password")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ oldPassword: "password123", newPassword: "brandnewpassword" });

        expect(change.status).toBe(200);

        const withNew = await request(app)
            .post("/api/v1/users/login")
            .send({ email: "account@example.com", password: "brandnewpassword" });
        expect(withNew.status).toBe(200);

        const withOld = await request(app)
            .post("/api/v1/users/login")
            .send({ email: "account@example.com", password: "password123" });
        expect(withOld.status).toBe(401);
    });

    it("stores the new password hashed, never in plain text", async () => {
        await request(app)
            .post("/api/v1/users/change-password")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ oldPassword: "password123", newPassword: "brandnewpassword" });

        const persisted = await User.findById(user._id).select("+password");
        expect(persisted.password).not.toBe("brandnewpassword");
        expect(persisted.password).toMatch(/^\$2[aby]\$/); // bcrypt hash prefix
    });
});

describe("PATCH /api/v1/users/history/add/:videoId", () => {
    it("adds a watched video to the history", async () => {
        const res = await request(app)
            .patch(`/api/v1/users/history/add/${video._id}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);

        const persisted = await User.findById(user._id);
        expect(persisted.watchHistory.map(String)).toEqual([video._id.toString()]);
    });

    it("moves a re-watched video to the front without duplicating it", async () => {
        const second = await Video.create({
            videoFile: "https://cdn.test/second.mp4",
            thumbnail: "https://cdn.test/second.jpg",
            title: "Second",
            description: "Second video",
            duration: 20,
            owner: user._id,
        });

        await request(app)
            .patch(`/api/v1/users/history/add/${video._id}`)
            .set("Authorization", `Bearer ${accessToken}`);
        await request(app)
            .patch(`/api/v1/users/history/add/${second._id}`)
            .set("Authorization", `Bearer ${accessToken}`);
        await request(app)
            .patch(`/api/v1/users/history/add/${video._id}`)
            .set("Authorization", `Bearer ${accessToken}`);

        const persisted = await User.findById(user._id);
        expect(persisted.watchHistory.map(String)).toEqual([
            video._id.toString(),
            second._id.toString(),
        ]);
    });

    it("returns 400 for a malformed video id", async () => {
        const res = await request(app)
            .patch("/api/v1/users/history/add/not-an-objectid")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(400);
    });

    it("returns 404 for a video that does not exist", async () => {
        const res = await request(app)
            .patch(`/api/v1/users/history/add/${new mongoose.Types.ObjectId()}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Video not found");
    });
});

describe("Theme preference", () => {
    it("returns the default theme for a new user", async () => {
        const res = await request(app)
            .get("/api/v1/users/theme")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(["light", "dark"]).toContain(res.body.data.prefferedTheme);
    });

    it("toggles the theme and persists it", async () => {
        const before = await User.findById(user._id);
        const opposite = before.prefferedTheme === "light" ? "dark" : "light";

        const res = await request(app)
            .patch("/api/v1/users/theme")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.prefferedTheme).toBe(opposite);

        const after = await User.findById(user._id);
        expect(after.prefferedTheme).toBe(opposite);
    });

    it("requires authentication", async () => {
        const res = await request(app).get("/api/v1/users/theme");
        expect(res.status).toBe(401);
    });
});
