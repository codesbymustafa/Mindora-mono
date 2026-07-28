// Engagement surface: likes, tweets, subscriptions, and the notification side effects
// they trigger. The existing suite covers the main toggle flows; the gaps here are the
// notification fan-out rules (especially "don't notify yourself"), the invalid-id and
// not-found branches, and the healthcheck endpoint, which had no test at all.
import { describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { app } from "../src/app.js";
import { User } from "../src/models/user.model.js";
import { Video } from "../src/models/video.model.js";
import { Comment } from "../src/models/comment.model.js";
import { Tweet } from "../src/models/tweet.model.js";
import { Like } from "../src/models/like.model.js";
import { Subscription } from "../src/models/subscription.model.js";
import { Notification } from "../src/models/notification.model.js";

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

const GHOST = () => new mongoose.Types.ObjectId();

let creator;
let fan;
let creatorToken;
let fanToken;
let video;

beforeEach(async () => {
    creator = await User.create({
        username: "creator",
        email: "creator@example.com",
        fullName: "Content Creator",
        avatar: "https://example.com/a.png",
        password: "password123",
    });
    fan = await User.create({
        username: "fan",
        email: "fan@example.com",
        fullName: "Loyal Fan",
        avatar: "https://example.com/b.png",
        password: "password123",
    });
    creatorToken = tokenFor(creator);
    fanToken = tokenFor(fan);

    video = await Video.create({
        videoFile: "https://cdn.test/video.mp4",
        thumbnail: "https://cdn.test/thumb.jpg",
        title: "A great video",
        description: "Worth liking",
        duration: 30,
        owner: creator._id,
    });
});

describe("GET /api/v1/healthcheck", () => {
    it("reports healthy without requiring authentication", async () => {
        const res = await request(app).get("/api/v1/healthcheck");

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Health check passed");
        expect(res.body.success).toBe(true);
    });
});

describe("Video likes", () => {
    it("likes a video and notifies the owner", async () => {
        const res = await request(app)
            .post(`/api/v1/like/v/${video._id}`)
            .set("Authorization", `Bearer ${fanToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toMatchObject({ totalLikes: 1, isLikedbyUser: true });

        await expect(Like.countDocuments({ video: video._id })).resolves.toBe(1);

        const notifications = await Notification.find({ type: "VIDEO_LIKE" });
        expect(notifications).toHaveLength(1);
        expect(notifications[0].recipient.toString()).toBe(creator._id.toString());
        expect(notifications[0].sender.toString()).toBe(fan._id.toString());
        expect(notifications[0].message).toContain("A great video");
    });

    it("does not notify you when you like your own video", async () => {
        const res = await request(app)
            .post(`/api/v1/like/v/${video._id}`)
            .set("Authorization", `Bearer ${creatorToken}`);

        expect(res.status).toBe(200);
        await expect(Notification.countDocuments()).resolves.toBe(0);
    });

    it("toggles the like off on a second call and sends no second notification", async () => {
        await request(app)
            .post(`/api/v1/like/v/${video._id}`)
            .set("Authorization", `Bearer ${fanToken}`);

        const res = await request(app)
            .post(`/api/v1/like/v/${video._id}`)
            .set("Authorization", `Bearer ${fanToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toMatchObject({ totalLikes: 0, isLikedbyUser: false });
        await expect(Like.countDocuments({ video: video._id })).resolves.toBe(0);
        // The unlike path must not fire another notification.
        await expect(Notification.countDocuments({ type: "VIDEO_LIKE" })).resolves.toBe(1);
    });

    it("counts likes from different users independently", async () => {
        await request(app)
            .post(`/api/v1/like/v/${video._id}`)
            .set("Authorization", `Bearer ${fanToken}`);
        await request(app)
            .post(`/api/v1/like/v/${video._id}`)
            .set("Authorization", `Bearer ${creatorToken}`);

        const res = await request(app)
            .get(`/api/v1/like/v/${video._id}`)
            .set("Authorization", `Bearer ${fanToken}`);

        expect(res.body.data.totalLikes).toBe(2);
        expect(res.body.data.isLikedbyUser).toBe(true);
    });

    it("reports isLikedbyUser false for a user who has not liked it", async () => {
        await request(app)
            .post(`/api/v1/like/v/${video._id}`)
            .set("Authorization", `Bearer ${creatorToken}`);

        const res = await request(app)
            .get(`/api/v1/like/v/${video._id}`)
            .set("Authorization", `Bearer ${fanToken}`);

        expect(res.body.data.totalLikes).toBe(1);
        expect(res.body.data.isLikedbyUser).toBe(false);
    });

    it("returns 400 for a malformed video id", async () => {
        const res = await request(app)
            .post("/api/v1/like/v/not-an-objectid")
            .set("Authorization", `Bearer ${fanToken}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid video ID");
    });

    it("returns 404 when liking a video that does not exist", async () => {
        const res = await request(app)
            .post(`/api/v1/like/v/${GHOST()}`)
            .set("Authorization", `Bearer ${fanToken}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Video not found");
    });
});

describe("Comment likes", () => {
    let comment;

    beforeEach(async () => {
        comment = await Comment.create({
            content: "Nice video",
            video: video._id,
            owner: creator._id,
        });
    });

    it("likes a comment and reports the count", async () => {
        const res = await request(app)
            .post(`/api/v1/like/c/${comment._id}`)
            .set("Authorization", `Bearer ${fanToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toMatchObject({ totalLikes: 1, isLikedbyUser: true });
    });

    it("toggles a comment like off", async () => {
        await request(app)
            .post(`/api/v1/like/c/${comment._id}`)
            .set("Authorization", `Bearer ${fanToken}`);
        const res = await request(app)
            .post(`/api/v1/like/c/${comment._id}`)
            .set("Authorization", `Bearer ${fanToken}`);

        expect(res.body.data).toMatchObject({ totalLikes: 0, isLikedbyUser: false });
    });

    it("returns 400 for a malformed comment id", async () => {
        const res = await request(app)
            .get("/api/v1/like/c/not-an-objectid")
            .set("Authorization", `Bearer ${fanToken}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid comment ID");
    });

    it("returns 404 when liking a comment that does not exist", async () => {
        const res = await request(app)
            .post(`/api/v1/like/c/${GHOST()}`)
            .set("Authorization", `Bearer ${fanToken}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Comment not found");
    });
});

describe("Tweet likes", () => {
    let tweet;

    beforeEach(async () => {
        tweet = await Tweet.create({ content: "Hello world", owner: creator._id });
    });

    it("likes a tweet and reports the count", async () => {
        const res = await request(app)
            .post(`/api/v1/like/t/${tweet._id}`)
            .set("Authorization", `Bearer ${fanToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toMatchObject({ totalLikes: 1, isLikedbyUser: true });
    });

    it("returns 400 for a malformed tweet id", async () => {
        const res = await request(app)
            .get("/api/v1/like/t/not-an-objectid")
            .set("Authorization", `Bearer ${fanToken}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid tweet ID");
    });

    it("returns 404 when liking a tweet that does not exist", async () => {
        const res = await request(app)
            .post(`/api/v1/like/t/${GHOST()}`)
            .set("Authorization", `Bearer ${fanToken}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("Tweet not found");
    });
});

describe("GET /api/v1/like/videos — liked videos library", () => {
    it("returns only the videos the caller has liked", async () => {
        const otherVideo = await Video.create({
            videoFile: "https://cdn.test/other.mp4",
            thumbnail: "https://cdn.test/other.jpg",
            title: "Unliked video",
            description: "Nobody liked this",
            duration: 10,
            owner: creator._id,
        });

        await request(app)
            .post(`/api/v1/like/v/${video._id}`)
            .set("Authorization", `Bearer ${fanToken}`);

        const res = await request(app)
            .get("/api/v1/like/videos")
            .set("Authorization", `Bearer ${fanToken}`);

        expect(res.status).toBe(200);
        const titles = JSON.stringify(res.body.data);
        expect(titles).toContain("A great video");
        expect(titles).not.toContain(otherVideo.title);
    });

    it("returns an empty result for a user who has liked nothing", async () => {
        const res = await request(app)
            .get("/api/v1/like/videos")
            .set("Authorization", `Bearer ${fanToken}`);

        expect(res.status).toBe(200);
        expect(JSON.stringify(res.body.data)).not.toContain("A great video");
    });
});

describe("Tweets", () => {
    it("notifies every subscriber when a tweet is created", async () => {
        await Subscription.create({ subscriber: fan._id, channel: creator._id });

        const res = await request(app)
            .post("/api/v1/tweets")
            .set("Authorization", `Bearer ${creatorToken}`)
            .send({ content: "New tweet for my subscribers" });

        expect(res.status).toBe(201);

        const notifications = await Notification.find({ type: "NEW_TWEET" });
        expect(notifications).toHaveLength(1);
        expect(notifications[0].recipient.toString()).toBe(fan._id.toString());
        expect(notifications[0].message).toContain("Content Creator");
    });

    it("creates no notifications when the author has no subscribers", async () => {
        const res = await request(app)
            .post("/api/v1/tweets")
            .set("Authorization", `Bearer ${creatorToken}`)
            .send({ content: "Talking to nobody" });

        expect(res.status).toBe(201);
        await expect(Notification.countDocuments()).resolves.toBe(0);
    });

    it("returns 404 when listing tweets for a user that does not exist", async () => {
        const res = await request(app)
            .get(`/api/v1/tweets/user/${GHOST()}`)
            .set("Authorization", `Bearer ${creatorToken}`);

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("User not found");
    });

    it("lists a user's tweets newest first", async () => {
        await Tweet.create({ content: "older", owner: creator._id, createdAt: new Date("2024-01-01") });
        await Tweet.create({ content: "newer", owner: creator._id, createdAt: new Date("2025-01-01") });

        const res = await request(app)
            .get(`/api/v1/tweets/user/${creator._id}`)
            .set("Authorization", `Bearer ${creatorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.data[0].content).toBe("newer");
    });
});

describe("Subscriptions", () => {
    it("subscribes on first toggle and unsubscribes on the second", async () => {
        const subscribe = await request(app)
            .post(`/api/v1/subscriptions/c/${creator._id}`)
            .set("Authorization", `Bearer ${fanToken}`);

        expect(subscribe.status).toBe(201);
        await expect(
            Subscription.countDocuments({ subscriber: fan._id, channel: creator._id }),
        ).resolves.toBe(1);

        const unsubscribe = await request(app)
            .post(`/api/v1/subscriptions/c/${creator._id}`)
            .set("Authorization", `Bearer ${fanToken}`);

        expect(unsubscribe.status).toBe(200);
        await expect(
            Subscription.countDocuments({ subscriber: fan._id, channel: creator._id }),
        ).resolves.toBe(0);
    });

    it("lists the channels a user subscribes to", async () => {
        await Subscription.create({ subscriber: fan._id, channel: creator._id });

        const res = await request(app)
            .get("/api/v1/subscriptions/u")
            .set("Authorization", `Bearer ${fanToken}`);

        expect(res.status).toBe(200);
        expect(JSON.stringify(res.body.data)).toContain("creator");
    });

    it("lists a channel's subscribers with a total count", async () => {
        await Subscription.create({ subscriber: fan._id, channel: creator._id });

        const res = await request(app)
            .get("/api/v1/subscriptions/c")
            .set("Authorization", `Bearer ${creatorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.totalSubscribers).toBe(1);
        expect(res.body.data.subscribers[0].username).toBe("fan");
    });

    it("reports zero subscribers for a channel nobody follows", async () => {
        const res = await request(app)
            .get("/api/v1/subscriptions/c")
            .set("Authorization", `Bearer ${creatorToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.totalSubscribers).toBe(0);
        expect(res.body.data.subscribers).toEqual([]);
    });

    // PRIVACY CONCERN (subscription.controller.js): the $project stage includes
    // `email: "$subscriberInfo.email"`, so any channel owner can read the email address
    // of every one of their subscribers. Nothing in the product needs that. This test
    // documents the behaviour as it stands rather than asserting it is correct -- flip it
    // to `.not.toHaveProperty("email")` when the field is dropped from the projection.
    it("currently exposes subscriber email addresses to the channel owner", async () => {
        await Subscription.create({ subscriber: fan._id, channel: creator._id });

        const res = await request(app)
            .get("/api/v1/subscriptions/c")
            .set("Authorization", `Bearer ${creatorToken}`);

        expect(res.body.data.subscribers[0]).toHaveProperty("email", "fan@example.com");
    });
});
