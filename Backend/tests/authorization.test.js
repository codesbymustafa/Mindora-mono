// Cross-user authorization and input-validation edges.
// The existing suite covers happy paths and missing-token cases well; what it mostly
// doesn't cover is the "authenticated, but not YOUR resource" branch — the one that
// actually keeps users out of each other's data. Every test here is a real user with
// a real token acting on someone else's resource.
import { describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { app } from "../src/app.js";
import { User } from "../src/models/user.model.js";
import { Video } from "../src/models/video.model.js";
import { Playlist } from "../src/models/playlist.model.js";
import { Comment } from "../src/models/comment.model.js";
import { Tweet } from "../src/models/tweet.model.js";

const tokenFor = (user) =>
    jwt.sign(
        {
            _id: user._id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" },
    );

let owner;
let intruder;
let ownerToken;
let intruderToken;
let video;

beforeEach(async () => {
    owner = await User.create({
        username: "resourceowner",
        email: "owner@example.com",
        fullName: "Resource Owner",
        avatar: "https://example.com/a.png",
        password: "password123",
    });
    intruder = await User.create({
        username: "intruder",
        email: "intruder@example.com",
        fullName: "Intruder",
        avatar: "https://example.com/b.png",
        password: "password123",
    });
    ownerToken = tokenFor(owner);
    intruderToken = tokenFor(intruder);

    video = await Video.create({
        videoFile: "https://cdn.test/video.mp4",
        thumbnail: "https://cdn.test/thumb.jpg",
        title: "Owner's video",
        description: "Belongs to the owner",
        duration: 30,
        owner: owner._id,
    });
});

describe("Playlist authorization", () => {
    let playlist;

    beforeEach(async () => {
        playlist = await Playlist.create({
            name: "Owner's playlist",
            description: "Private collection",
            owner: owner._id,
            videos: [],
        });
    });

    it("forbids a non-owner from adding a video to someone else's playlist", async () => {
        const res = await request(app)
            .patch(`/api/v1/playlist/add/${video._id}/${playlist._id}`)
            .set("Authorization", `Bearer ${intruderToken}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("You are not authorized to modify this playlist");

        const unchanged = await Playlist.findById(playlist._id);
        expect(unchanged.videos).toHaveLength(0);
    });

    it("forbids a non-owner from removing a video from someone else's playlist", async () => {
        playlist.videos.push(video._id);
        await playlist.save();

        const res = await request(app)
            .patch(`/api/v1/playlist/remove/${video._id}/${playlist._id}`)
            .set("Authorization", `Bearer ${intruderToken}`);

        expect(res.status).toBe(403);

        const unchanged = await Playlist.findById(playlist._id);
        expect(unchanged.videos).toHaveLength(1);
    });

    it("forbids a non-owner from updating someone else's playlist", async () => {
        const res = await request(app)
            .patch(`/api/v1/playlist/${playlist._id}`)
            .set("Authorization", `Bearer ${intruderToken}`)
            .send({ name: "Hijacked", description: "Hijacked" });

        expect(res.status).toBe(403);

        const unchanged = await Playlist.findById(playlist._id);
        expect(unchanged.name).toBe("Owner's playlist");
    });

    it("forbids a non-owner from deleting someone else's playlist", async () => {
        const res = await request(app)
            .delete(`/api/v1/playlist/${playlist._id}`)
            .set("Authorization", `Bearer ${intruderToken}`);

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("You are not authorized to delete this playlist");
        await expect(Playlist.findById(playlist._id)).resolves.not.toBeNull();
    });

    it("returns 404 when adding a video that does not exist", async () => {
        const ghostId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .patch(`/api/v1/playlist/add/${ghostId}/${playlist._id}`)
            .set("Authorization", `Bearer ${ownerToken}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Video not found");
    });

    it("returns 400 when removing a video that is not in the playlist", async () => {
        const res = await request(app)
            .patch(`/api/v1/playlist/remove/${video._id}/${playlist._id}`)
            .set("Authorization", `Bearer ${ownerToken}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Video not found in playlist");
    });

    it("returns 400 for a whitespace-only playlist name", async () => {
        const res = await request(app)
            .post("/api/v1/playlist")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({ name: "   ", description: "valid" });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Playlist name cannot be empty");
    });

    it("returns 400 for a whitespace-only playlist description", async () => {
        const res = await request(app)
            .post("/api/v1/playlist")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({ name: "valid", description: "   " });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Playlist description cannot be empty");
    });

    it("returns 404 when listing playlists for a user that does not exist", async () => {
        const ghostId = new mongoose.Types.ObjectId();

        const res = await request(app)
            .get(`/api/v1/playlist/user/${ghostId}`)
            .set("Authorization", `Bearer ${ownerToken}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("User not found");
    });
});

describe("Video authorization", () => {
    it("forbids a non-owner from updating someone else's video", async () => {
        const res = await request(app)
            .patch(`/api/v1/videos/${video._id}`)
            .set("Authorization", `Bearer ${intruderToken}`)
            .field("title", "Hijacked title")
            .field("description", "Hijacked description");

        expect(res.status).toBe(403);
        expect(res.body.message).toBe("You are not authorized to modify this video");

        const unchanged = await Video.findById(video._id);
        expect(unchanged.title).toBe("Owner's video");
    });

    it("forbids a non-owner from deleting someone else's video", async () => {
        const res = await request(app)
            .delete(`/api/v1/videos/${video._id}`)
            .set("Authorization", `Bearer ${intruderToken}`);

        expect(res.status).toBe(403);
        await expect(Video.findById(video._id)).resolves.not.toBeNull();
    });

    it("forbids a non-owner from toggling publish state on someone else's video", async () => {
        const before = video.isPublished;

        const res = await request(app)
            .patch(`/api/v1/videos/toggle/publish/${video._id}`)
            .set("Authorization", `Bearer ${intruderToken}`);

        expect(res.status).toBe(403);

        const unchanged = await Video.findById(video._id);
        expect(unchanged.isPublished).toBe(before);
    });

    it("returns 400 for a whitespace-only title on update", async () => {
        const res = await request(app)
            .patch(`/api/v1/videos/${video._id}`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .field("title", "   ")
            .field("description", "still valid");

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Title and description cannot be empty");
    });
});

describe("Comment authorization", () => {
    let comment;

    beforeEach(async () => {
        comment = await Comment.create({
            content: "Owner's comment",
            video: video._id,
            owner: owner._id,
        });
    });

    it("forbids a non-owner from updating someone else's comment", async () => {
        const res = await request(app)
            .patch(`/api/v1/comments/c/${comment._id}`)
            .set("Authorization", `Bearer ${intruderToken}`)
            .send({ content: "Hijacked" });

        expect(res.status).toBe(403);

        const unchanged = await Comment.findById(comment._id);
        expect(unchanged.content).toBe("Owner's comment");
    });

    it("forbids a non-owner from deleting someone else's comment", async () => {
        const res = await request(app)
            .delete(`/api/v1/comments/c/${comment._id}`)
            .set("Authorization", `Bearer ${intruderToken}`);

        expect(res.status).toBe(403);
        await expect(Comment.findById(comment._id)).resolves.not.toBeNull();
    });
});

describe("Tweet authorization", () => {
    let tweet;

    beforeEach(async () => {
        tweet = await Tweet.create({
            content: "Owner's tweet",
            owner: owner._id,
        });
    });

    it("forbids a non-owner from updating someone else's tweet", async () => {
        const res = await request(app)
            .patch(`/api/v1/tweets/${tweet._id}`)
            .set("Authorization", `Bearer ${intruderToken}`)
            .send({ content: "Hijacked" });

        expect(res.status).toBe(403);

        const unchanged = await Tweet.findById(tweet._id);
        expect(unchanged.content).toBe("Owner's tweet");
    });

    it("forbids a non-owner from deleting someone else's tweet", async () => {
        const res = await request(app)
            .delete(`/api/v1/tweets/${tweet._id}`)
            .set("Authorization", `Bearer ${intruderToken}`);

        expect(res.status).toBe(403);
        await expect(Tweet.findById(tweet._id)).resolves.not.toBeNull();
    });
});

describe("Token handling", () => {
    it("rejects a token signed with the wrong secret", async () => {
        const forged = jwt.sign({ _id: owner._id }, "not-the-real-secret", {
            expiresIn: "1d",
        });

        const res = await request(app)
            .get("/api/v1/users/current-user")
            .set("Authorization", `Bearer ${forged}`);

        expect(res.status).toBe(401);
    });

    it("rejects an expired token", async () => {
        const expired = jwt.sign(
            { _id: owner._id, username: owner.username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "-1s" },
        );

        const res = await request(app)
            .get("/api/v1/users/current-user")
            .set("Authorization", `Bearer ${expired}`);

        expect(res.status).toBe(401);
    });

    it("rejects a well-formed token whose user no longer exists", async () => {
        const ghost = await User.create({
            username: "ghost",
            email: "ghost@example.com",
            fullName: "Ghost User",
            avatar: "https://example.com/g.png",
            password: "password123",
        });
        const ghostToken = tokenFor(ghost);
        await User.findByIdAndDelete(ghost._id);

        const res = await request(app)
            .get("/api/v1/users/current-user")
            .set("Authorization", `Bearer ${ghostToken}`);

        expect(res.status).toBe(401);
    });
});
