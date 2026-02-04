import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { app } from "../../src/app.js";
import { User } from "../../src/models/user.model.js";
import { Video } from "../../src/models/video.model.js";
import { Subscription } from "../../src/models/subscription.model.js";
import { Like } from "../../src/models/like.model.js";
import { Comment } from "../../src/models/comment.model.js";
import { DB_NAME } from "../../src/constants.js";

const SAMPLE_VIDEO_URLS = [
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
];

const imageUrl = (n) => `https://yavuzceliker.github.io/sample-images/image-${n}.jpg`;

describe("Dashboard API Endpoints", () => {
    let testUser;
    let testUser2;
    let accessToken;

    beforeAll(async () => {
        // Connect to test database
        const mongoUri = process.env.MONGODB_URI + "/" + DB_NAME +"_test";
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        // Clean up and close connection
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        // Clear collections before each test
        await User.deleteMany({});
        await Video.deleteMany({});
        await Subscription.deleteMany({});
        await Like.deleteMany({});
        await Comment.deleteMany({});

        // Create test user (channel owner)
        testUser = await User.create({
            username: "testchannel",
            email: "testchannel@example.com",
            fullName: "Test Channel",
            avatar: imageUrl(1),
            coverImage: imageUrl(2),
            password: "password123",
        });

        // Create another user (subscriber)
        testUser2 = await User.create({
            username: "subscriber",
            email: "subscriber@example.com",
            fullName: "Test Subscriber",
            avatar: imageUrl(3),
            password: "password123",
        });

        // Generate access token for the test user
        accessToken = jwt.sign(
            {
                _id: testUser._id,
                email: testUser.email,
                username: testUser.username,
                fullName: testUser.fullName,
            },
            process.env.ACCESS_TOKEN_SECRET || "test-secret",
            { expiresIn: "1d" }
        );

    });

    afterEach(async () => {
        // Clear collections after each test
        await User.deleteMany({});
        await Video.deleteMany({});
        await Subscription.deleteMany({});
        await Like.deleteMany({});
        await Comment.deleteMany({});
    });

    describe("GET /api/v1/dashboard/stats", () => {
        it("should return 401 if no access token is provided", async () => {
            const response = await request(app)
                .get("/api/v1/dashboard/stats")
                .expect(401);

            expect(response.body.message).toBeDefined();
        });

        it("should return 401 if invalid access token is provided", async () => {
            const response = await request(app)
                .get("/api/v1/dashboard/stats")
                .set("Authorization", "Bearer invalid-token")
                .expect(401);

            expect(response.body.message).toBeDefined();
        });

        it("should return channel stats with zero counts for new channel", async () => {
            const response = await request(app)
                .get("/api/v1/dashboard/stats")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.statusCode).toBe(200);
            expect(response.body.data).toBeDefined();
            expect(response.body.data.subscribersCount).toBe(0);
            expect(response.body.data.totalVideosCount).toBe(0);
            expect(response.body.data.totalViewsGotCount).toBe(0);
            expect(response.body.data.totalLikesGotCount).toBe(0);
            expect(response.body.data.totalCommentsGotCount).toBe(0);
            expect(response.body.message).toBe("Channel stats fetched successfully");
        });

        it("should return correct subscribers count", async () => {
            // Create subscriptions to the test user's channel
            await Subscription.create({
                subscriber: testUser2._id,
                channel: testUser._id,
            });

            const response = await request(app)
                .get("/api/v1/dashboard/stats")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.data.subscribersCount).toBe(1);
        });

        it("should return correct total videos count", async () => {
            // Create videos for the test user
            await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[0],
                thumbnail: imageUrl(10),
                title: "Test Video 1",
                description: "Test description 1",
                duration: 120,
                owner: testUser._id,
            });

            await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[1],
                thumbnail: imageUrl(11),
                title: "Test Video 2",
                description: "Test description 2",
                duration: 180,
                owner: testUser._id,
            });

            const response = await request(app)
                .get("/api/v1/dashboard/stats")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.data.totalVideosCount).toBe(2);
        });

        it("should return correct total views count", async () => {
            // Create a video with views
            await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[2],
                thumbnail: imageUrl(12),
                title: "Test Video 1",
                description: "Test description 1",
                duration: 120,
                owner: testUser._id,
                views: [testUser2._id, testUser._id], // 2 views
            });

            const response = await request(app)
                .get("/api/v1/dashboard/stats")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.data.totalViewsGotCount).toBe(2);
        });

        it("should return correct total likes count", async () => {
            // Create a video
            const video = await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[3],
                thumbnail: imageUrl(13),
                title: "Test Video 1",
                description: "Test description 1",
                duration: 120,
                owner: testUser._id,
            });

            // Create likes on the video
            await Like.create({
                video: video._id,
                likedBy: testUser2._id,
            });

            await Like.create({
                video: video._id,
                likedBy: testUser._id,
            });

            const response = await request(app)
                .get("/api/v1/dashboard/stats")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.data.totalLikesGotCount).toBe(2);
        });

        it("should return correct total comments count", async () => {
            // Create a video
            const video = await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[4],
                thumbnail: imageUrl(14),
                title: "Test Video 1",
                description: "Test description 1",
                duration: 120,
                owner: testUser._id,
            });

            // Create comments on the video
            await Comment.create({
                content: "Great video!",
                video: video._id,
                owner: testUser2._id,
            });

            await Comment.create({
                content: "Thanks for watching!",
                video: video._id,
                owner: testUser._id,
            });

            const response = await request(app)
                .get("/api/v1/dashboard/stats")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.data.totalCommentsGotCount).toBe(2);
        });

        it("should return complete channel stats with all data", async () => {
            // Create subscription
            await Subscription.create({
                subscriber: testUser2._id,
                channel: testUser._id,
            });

            // Create videos with views
            const video1 = await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[5],
                thumbnail: imageUrl(15),
                title: "Test Video 1",
                description: "Test description 1",
                duration: 120,
                owner: testUser._id,
                views: [testUser2._id],
            });

            const video2 = await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[6],
                thumbnail: imageUrl(16),
                title: "Test Video 2",
                description: "Test description 2",
                duration: 180,
                owner: testUser._id,
                views: [testUser2._id, testUser._id],
            });

            // Create likes
            await Like.create({ video: video1._id, likedBy: testUser2._id });
            await Like.create({ video: video2._id, likedBy: testUser2._id });

            // Create comments
            await Comment.create({
                content: "Great video!",
                video: video1._id,
                owner: testUser2._id,
            });

            const response = await request(app)
                .get("/api/v1/dashboard/stats")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.statusCode).toBe(200);
            expect(response.body.data.subscribersCount).toBe(1);
            expect(response.body.data.totalVideosCount).toBe(2);
            expect(response.body.data.totalViewsGotCount).toBe(3);
            expect(response.body.data.totalLikesGotCount).toBe(2);
            expect(response.body.data.totalCommentsGotCount).toBe(1);
        });

        it("should only count stats for the authenticated user's channel", async () => {
            // Create a video for testUser2 (not the authenticated user)
            await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[7],
                thumbnail: imageUrl(17),
                title: "Other User Video",
                description: "Test description",
                duration: 120,
                owner: testUser2._id,
                views: [testUser._id],
            });

            const response = await request(app)
                .get("/api/v1/dashboard/stats")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            // Should not count the video from testUser2
            expect(response.body.data.totalVideosCount).toBe(0);
            expect(response.body.data.totalViewsGotCount).toBe(0);
        });

        it("should accept token from cookies", async () => {
            const response = await request(app)
                .get("/api/v1/dashboard/stats")
                .set("Cookie", `accessToken=${accessToken}`)
                .expect(200);

            expect(response.body.statusCode).toBe(200);
            expect(response.body.data).toBeDefined();
        });
    });

    describe("GET /api/v1/dashboard/videos", () => {
        it("should return 401 if no access token is provided", async () => {
            const response = await request(app)
                .get("/api/v1/dashboard/videos")
                .expect(401);

            expect(response.body.message).toBeDefined();
        });

        it("should return 401 if invalid access token is provided", async () => {
            const response = await request(app)
                .get("/api/v1/dashboard/videos")
                .set("Authorization", "Bearer invalid-token")
                .expect(401);

            expect(response.body.message).toBeDefined();
        });

        it("should return empty array for channel with no videos", async () => {
            const response = await request(app)
                .get("/api/v1/dashboard/videos")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.statusCode).toBe(200);
            expect(response.body.data).toEqual([]);
            expect(response.body.message).toBe("Channel videos fetched successfully");
        });

        it("should return all videos for the channel", async () => {
            // Create videos for the test user
            await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[8],
                thumbnail: imageUrl(18),
                title: "Test Video 1",
                description: "Test description 1",
                duration: 120,
                owner: testUser._id,
            });

            await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[9],
                thumbnail: imageUrl(19),
                title: "Test Video 2",
                description: "Test description 2",
                duration: 180,
                owner: testUser._id,
            });

            const response = await request(app)
                .get("/api/v1/dashboard/videos")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.statusCode).toBe(200);
            expect(response.body.data).toHaveLength(2);
            expect(response.body.data[0].owner.toString()).toBe(testUser._id.toString());
            expect(response.body.data[1].owner.toString()).toBe(testUser._id.toString());
        });

        it("should return videos sorted by createdAt in descending order", async () => {
            // Create videos with slight delay to ensure different timestamps
            const video1 = await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[10],
                thumbnail: imageUrl(20),
                title: "First Video",
                description: "Created first",
                duration: 120,
                owner: testUser._id,
            });

            // Small delay to ensure different createdAt timestamps
            await new Promise((resolve) => setTimeout(resolve, 10));

            const video2 = await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[11],
                thumbnail: imageUrl(21),
                title: "Second Video",
                description: "Created second",
                duration: 180,
                owner: testUser._id,
            });

            const response = await request(app)
                .get("/api/v1/dashboard/videos")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.data).toHaveLength(2);
            // Most recent video should be first
            expect(response.body.data[0].title).toBe("Second Video");
            expect(response.body.data[1].title).toBe("First Video");
        });

        it("should only return videos owned by the authenticated user", async () => {
            // Create a video for testUser
            await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[0],
                thumbnail: imageUrl(22),
                title: "My Video",
                description: "Test description",
                duration: 120,
                owner: testUser._id,
            });

            // Create a video for testUser2
            await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[1],
                thumbnail: imageUrl(23),
                title: "Other User Video",
                description: "Test description",
                duration: 180,
                owner: testUser2._id,
            });

            const response = await request(app)
                .get("/api/v1/dashboard/videos")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].title).toBe("My Video");
        });

        it("should return video with all expected fields", async () => {
            await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[2],
                thumbnail: imageUrl(24),
                title: "Test Video",
                description: "Test description",
                duration: 120,
                owner: testUser._id,
                isPublished: true,
                views: [testUser2._id],
            });

            const response = await request(app)
                .get("/api/v1/dashboard/videos")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.data).toHaveLength(1);
            const video = response.body.data[0];
            expect(video.videoFile).toBe(SAMPLE_VIDEO_URLS[2]);
            expect(video.thumbnail).toBe(imageUrl(24));
            expect(video.title).toBe("Test Video");
            expect(video.description).toBe("Test description");
            expect(video.duration).toBe(120);
            expect(video.isPublished).toBe(true);
            expect(video.views).toHaveLength(1);
            expect(video.createdAt).toBeDefined();
            expect(video.updatedAt).toBeDefined();
        });

        it("should return both published and unpublished videos", async () => {
            await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[3],
                thumbnail: imageUrl(25),
                title: "Published Video",
                description: "Test description",
                duration: 120,
                owner: testUser._id,
                isPublished: true,
            });

            await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[4],
                thumbnail: imageUrl(26),
                title: "Unpublished Video",
                description: "Test description",
                duration: 180,
                owner: testUser._id,
                isPublished: false,
            });

            const response = await request(app)
                .get("/api/v1/dashboard/videos")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.data).toHaveLength(2);
            const publishedStatuses = response.body.data.map((v) => v.isPublished);
            expect(publishedStatuses).toContain(true);
            expect(publishedStatuses).toContain(false);
        });

        it("should accept token from cookies", async () => {
            const response = await request(app)
                .get("/api/v1/dashboard/videos")
                .set("Cookie", `accessToken=${accessToken}`)
                .expect(200);

            expect(response.body.statusCode).toBe(200);
            expect(response.body.data).toEqual([]);
        });
    });

    describe("Dashboard API - Edge Cases", () => {
        it("should handle user with no channel activity gracefully", async () => {
            const response = await request(app)
                .get("/api/v1/dashboard/stats")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.data.subscribersCount).toBe(0);
            expect(response.body.data.totalVideosCount).toBe(0);
            expect(response.body.data.totalViewsGotCount).toBe(0);
            expect(response.body.data.totalLikesGotCount).toBe(0);
            expect(response.body.data.totalCommentsGotCount).toBe(0);
        });

        it("should handle videos with empty views array", async () => {
            await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[5],
                thumbnail: imageUrl(27),
                title: "No Views Video",
                description: "Test description",
                duration: 120,
                owner: testUser._id,
                views: [],
            });

            const response = await request(app)
                .get("/api/v1/dashboard/stats")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.data.totalViewsGotCount).toBe(0);
            expect(response.body.data.totalVideosCount).toBe(1);
        });

        it("should handle videos without views field", async () => {
            await Video.create({
                videoFile: SAMPLE_VIDEO_URLS[6],
                thumbnail: imageUrl(28),
                title: "No Views Field Video",
                description: "Test description",
                duration: 120,
                owner: testUser._id,
            });

            const response = await request(app)
                .get("/api/v1/dashboard/stats")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.data.totalViewsGotCount).toBe(0);
            expect(response.body.data.totalVideosCount).toBe(1);
        });

        it("should handle expired access token", async () => {
            const expiredToken = jwt.sign(
                {
                    _id: testUser._id,
                    email: testUser.email,
                    username: testUser.username,
                    fullName: testUser.fullName,
                },
                process.env.ACCESS_TOKEN_SECRET || "test-secret",
                { expiresIn: "-1s" } // Already expired
            );

            const response = await request(app)
                .get("/api/v1/dashboard/stats")
                .set("Authorization", `Bearer ${expiredToken}`)
                .expect(401);

            expect(response.body.message).toBeDefined();
        });

        it("should handle token for deleted user", async () => {
            // Create token for a user
            const tempUser = await User.create({
                username: "tempuser",
                email: "tempuser@example.com",
                fullName: "Temp User",
                avatar: imageUrl(4),
                password: "password123",
            });

            const tempToken = jwt.sign(
                {
                    _id: tempUser._id,
                    email: tempUser.email,
                    username: tempUser.username,
                    fullName: tempUser.fullName,
                },
                process.env.ACCESS_TOKEN_SECRET || "test-secret",
                { expiresIn: "1d" }
            );

            // Delete the user
            await User.findByIdAndDelete(tempUser._id);

            const response = await request(app)
                .get("/api/v1/dashboard/stats")
                .set("Authorization", `Bearer ${tempToken}`)
                .expect(401);

            expect(response.body.message).toBeDefined();
        });

        it("should handle multiple subscriptions correctly", async () => {
            // Create multiple subscribers
            const subscriber1 = await User.create({
                username: "sub1",
                email: "sub1@example.com",
                fullName: "Subscriber 1",
                avatar: imageUrl(5),
                password: "password123",
            });

            const subscriber2 = await User.create({
                username: "sub2",
                email: "sub2@example.com",
                fullName: "Subscriber 2",
                avatar: imageUrl(6),
                password: "password123",
            });

            await Subscription.create({ subscriber: subscriber1._id, channel: testUser._id });
            await Subscription.create({ subscriber: subscriber2._id, channel: testUser._id });
            await Subscription.create({ subscriber: testUser2._id, channel: testUser._id });

            const response = await request(app)
                .get("/api/v1/dashboard/stats")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.data.subscribersCount).toBe(3);
        });

        it("should handle large number of videos", async () => {
            // Create 10 videos
            const videoPromises = [];
            for (let i = 0; i < 10; i++) {
                videoPromises.push(
                    Video.create({
                        videoFile: SAMPLE_VIDEO_URLS[i % SAMPLE_VIDEO_URLS.length],
                        thumbnail: imageUrl(100 + i),
                        title: `Test Video ${i}`,
                        description: `Test description ${i}`,
                        duration: 120 + i,
                        owner: testUser._id,
                    })
                );
            }
            await Promise.all(videoPromises);

            const response = await request(app)
                .get("/api/v1/dashboard/videos")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.data).toHaveLength(10);
        });
    });
});
