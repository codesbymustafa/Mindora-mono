// Upload-dependent paths (register with avatar, avatar/cover updates, video publish).
// These are the parts of the API that talk to Cloudinary, which is why they were the
// biggest coverage gap: the existing suite can't exercise them without real credentials
// and a real network call. Here Cloudinary is mocked at the module boundary, so the
// controller logic around the upload runs for real while the upload itself does not.
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";

// Must be registered before app.js is imported, so the controllers pick up the mock.
const uploadToCloudinary = jest.fn();
const deleteFromCloudinary = jest.fn();

jest.unstable_mockModule("../src/utils/cloudinary.js", () => ({
    uploadToCloudinary,
    deleteFromCloudinary,
}));

const { app } = await import("../src/app.js");
const { User } = await import("../src/models/user.model.js");
const { Video } = await import("../src/models/video.model.js");
const { Subscription } = await import("../src/models/subscription.model.js");
const { Notification } = await import("../src/models/notification.model.js");

const PNG = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
);
const MP4 = Buffer.from("00000018667479706d70343200000000", "hex");

const cloudinaryAsset = (overrides = {}) => ({
    url: "https://res.cloudinary.com/demo/image/upload/v1/Mindora/asset.png",
    public_id: "Mindora/asset",
    duration: 0,
    ...overrides,
});

let owner;
let accessToken;

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

beforeEach(async () => {
    // resetMocks is on in jest.config.js, so implementations are re-attached per test.
    uploadToCloudinary.mockResolvedValue(cloudinaryAsset());
    deleteFromCloudinary.mockResolvedValue(true);

    owner = await User.create({
        username: "uploader",
        email: "uploader@example.com",
        fullName: "Upload Owner",
        avatar: "https://example.com/avatar.png",
        password: "password123",
    });
    accessToken = tokenFor(owner);
});

describe("POST /api/v1/users/register — avatar & cover upload", () => {
    it("uploads the avatar and stores the returned Cloudinary URL", async () => {
        uploadToCloudinary.mockResolvedValue(
            cloudinaryAsset({ url: "https://res.cloudinary.com/demo/avatar.png" }),
        );

        const res = await request(app)
            .post("/api/v1/users/register")
            .field("username", "newuser")
            .field("fullName", "New User")
            .field("email", "newuser@example.com")
            .field("password", "password123")
            .attach("avatar", PNG, "avatar.png");

        expect(res.status).toBe(201);
        expect(res.body.data.avatar).toBe("https://res.cloudinary.com/demo/avatar.png");
        expect(uploadToCloudinary).toHaveBeenCalledTimes(1);
        // The raw buffer from multer's memoryStorage is what reaches the uploader.
        expect(Buffer.isBuffer(uploadToCloudinary.mock.calls[0][0])).toBe(true);
    });

    it("never returns the password hash to the client", async () => {
        const res = await request(app)
            .post("/api/v1/users/register")
            .field("username", "nopassword")
            .field("fullName", "No Password")
            .field("email", "nopassword@example.com")
            .field("password", "password123")
            .attach("avatar", PNG, "avatar.png");

        expect(res.status).toBe(201);
        expect(res.body.data.password).toBeUndefined();
    });

    it("uploads avatar and cover image separately when both are supplied", async () => {
        uploadToCloudinary
            .mockResolvedValueOnce(cloudinaryAsset({ url: "https://cdn.test/avatar.png" }))
            .mockResolvedValueOnce(cloudinaryAsset({ url: "https://cdn.test/cover.png" }));

        const res = await request(app)
            .post("/api/v1/users/register")
            .field("username", "bothimages")
            .field("fullName", "Both Images")
            .field("email", "bothimages@example.com")
            .field("password", "password123")
            .attach("avatar", PNG, "avatar.png")
            .attach("coverImage", PNG, "cover.png");

        expect(res.status).toBe(201);
        expect(uploadToCloudinary).toHaveBeenCalledTimes(2);
        expect(res.body.data.avatar).toBe("https://cdn.test/avatar.png");
        expect(res.body.data.coverImage).toBe("https://cdn.test/cover.png");
    });

    it("returns 500 and does not persist the user when the avatar upload fails", async () => {
        uploadToCloudinary.mockRejectedValue(new Error("cloudinary is down"));

        const res = await request(app)
            .post("/api/v1/users/register")
            .field("username", "failedupload")
            .field("fullName", "Failed Upload")
            .field("email", "failedupload@example.com")
            .field("password", "password123")
            .attach("avatar", PNG, "avatar.png");

        expect(res.status).toBe(500);
        expect(res.body.message).toBe("Error uploading avatar");
        await expect(User.findOne({ username: "failedupload" })).resolves.toBeNull();
    });

    it("still creates the user when only the cover image upload fails", async () => {
        // The controller deliberately swallows cover-image failures: a cover is optional,
        // so a Cloudinary hiccup there must not block registration.
        uploadToCloudinary
            .mockResolvedValueOnce(cloudinaryAsset({ url: "https://cdn.test/avatar.png" }))
            .mockRejectedValueOnce(new Error("cover upload failed"));

        const res = await request(app)
            .post("/api/v1/users/register")
            .field("username", "covertolerant")
            .field("fullName", "Cover Tolerant")
            .field("email", "covertolerant@example.com")
            .field("password", "password123")
            .attach("avatar", PNG, "avatar.png")
            .attach("coverImage", PNG, "cover.png");

        expect(res.status).toBe(201);
        expect(res.body.data.coverImage).toBe("");
    });

    it("rejects a duplicate username with 409 and uploads nothing", async () => {
        const res = await request(app)
            .post("/api/v1/users/register")
            .field("username", "uploader")
            .field("fullName", "Duplicate User")
            .field("email", "different@example.com")
            .field("password", "password123");

        expect(res.status).toBe(409);
        expect(res.body.message).toBe("User already exists");
        expect(uploadToCloudinary).not.toHaveBeenCalled();
    });

    // KNOWN BUG (user.controller.js:57). Multer is configured with memoryStorage(), so
    // `avatarPath` is the image *bytes*, not a path -- but the duplicate-user branch calls
    // fs.unlinkSync(avatarPath) on it. Node throws ERR_INVALID_ARG_VALUE, which the error
    // handler turns into a 500 whose message embeds a hex dump of the uploaded file.
    // The two unlink lines are vestigial (they predate the switch to memoryStorage) and
    // deleting them fixes it. Passes while broken; fails once fixed.
    it.failing("rejects a duplicate username with 409 even when an avatar is attached", async () => {
        const res = await request(app)
            .post("/api/v1/users/register")
            .field("username", "uploader")
            .field("fullName", "Duplicate User")
            .field("email", "different@example.com")
            .field("password", "password123")
            .attach("avatar", PNG, "avatar.png");

        expect(res.status).toBe(409);
        expect(res.body.message).toBe("User already exists");
    });

    // KNOWN BUG, same root cause as above: the raw Node error reaches the client because
    // error.middleware.js forwards `err.message` verbatim for non-ApiError throws. Worth
    // asserting separately from the status code -- even once the 409 is fixed, unexpected
    // internal errors should never echo request bytes back to the caller.
    it.failing("does not leak raw file bytes in an error response", async () => {
        // Guards the information-disclosure half of the bug above, independently of the
        // status code: whatever goes wrong, the response must never echo the upload back.
        const res = await request(app)
            .post("/api/v1/users/register")
            .field("username", "uploader")
            .field("fullName", "Duplicate User")
            .field("email", "different@example.com")
            .field("password", "password123")
            .attach("avatar", PNG, "avatar.png");

        expect(res.body.message).not.toMatch(/<Buffer/);
    });
});

describe("PATCH /api/v1/users/avatar", () => {
    it("uploads the new avatar and returns the updated user", async () => {
        uploadToCloudinary.mockResolvedValue(
            cloudinaryAsset({ url: "https://cdn.test/new-avatar.png" }),
        );

        const res = await request(app)
            .patch("/api/v1/users/avatar")
            .set("Authorization", `Bearer ${accessToken}`)
            .attach("avatar", PNG, "avatar.png");

        expect(res.status).toBe(200);
        expect(res.body.data.avatar).toBe("https://cdn.test/new-avatar.png");

        const persisted = await User.findById(owner._id);
        expect(persisted.avatar).toBe("https://cdn.test/new-avatar.png");
    });

    it("returns 400 when no file is attached", async () => {
        const res = await request(app)
            .patch("/api/v1/users/avatar")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Avatar file is required");
        expect(uploadToCloudinary).not.toHaveBeenCalled();
    });

    it("requires authentication", async () => {
        const res = await request(app)
            .patch("/api/v1/users/avatar")
            .attach("avatar", PNG, "avatar.png");

        expect(res.status).toBe(401);
    });
});

describe("PATCH /api/v1/users/cover-image", () => {
    it("uploads the new cover image and returns the updated user", async () => {
        uploadToCloudinary.mockResolvedValue(
            cloudinaryAsset({ url: "https://cdn.test/new-cover.png" }),
        );

        const res = await request(app)
            .patch("/api/v1/users/cover-image")
            .set("Authorization", `Bearer ${accessToken}`)
            .attach("coverImage", PNG, "cover.png");

        expect(res.status).toBe(200);
        expect(res.body.data.coverImage).toBe("https://cdn.test/new-cover.png");
    });

    it("returns 400 when no file is attached", async () => {
        const res = await request(app)
            .patch("/api/v1/users/cover-image")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Cover Image file is required");
    });
});

describe("POST /api/v1/videos — publish", () => {
    const publish = (token) =>
        request(app).post("/api/v1/videos").set("Authorization", `Bearer ${token}`);

    it("uploads video and thumbnail and creates the video record", async () => {
        uploadToCloudinary
            .mockResolvedValueOnce(
                cloudinaryAsset({ url: "https://cdn.test/video.mp4", duration: 42 }),
            )
            .mockResolvedValueOnce(cloudinaryAsset({ url: "https://cdn.test/thumb.png" }));

        const res = await publish(accessToken)
            .field("title", "My Video")
            .field("description", "A description")
            .attach("videoFile", MP4, "video.mp4")
            .attach("thumbnail", PNG, "thumb.png");

        expect(res.status).toBe(201);
        expect(res.body.data.videoFile).toBe("https://cdn.test/video.mp4");
        expect(res.body.data.thumbnail).toBe("https://cdn.test/thumb.png");
        expect(res.body.data.duration).toBe(42);
        expect(uploadToCloudinary).toHaveBeenCalledTimes(2);
    });

    it("derives a thumbnail URL from the video URL when no thumbnail is supplied", async () => {
        // This is the "automatic thumbnail generation" behaviour: swap the video
        // extension for .jpg and let Cloudinary serve the derived still.
        uploadToCloudinary.mockResolvedValue(
            cloudinaryAsset({ url: "https://cdn.test/clip.mp4", duration: 10 }),
        );

        const res = await publish(accessToken)
            .field("title", "No Thumbnail")
            .field("description", "Auto thumb")
            .attach("videoFile", MP4, "video.mp4");

        expect(res.status).toBe(201);
        expect(res.body.data.thumbnail).toBe("https://cdn.test/clip.jpg");
        expect(uploadToCloudinary).toHaveBeenCalledTimes(1);
    });

    it("returns 400 when the video file is missing", async () => {
        const res = await publish(accessToken)
            .field("title", "No File")
            .field("description", "Missing video");

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Video file is required");
        expect(uploadToCloudinary).not.toHaveBeenCalled();
    });

    it("returns 400 when the title is missing", async () => {
        const res = await publish(accessToken)
            .field("description", "No title supplied")
            .attach("videoFile", MP4, "video.mp4");

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Title is required");
    });

    it("returns 400 when the description is missing", async () => {
        const res = await publish(accessToken)
            .field("title", "No description supplied")
            .attach("videoFile", MP4, "video.mp4");

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Description is required");
    });

    it("returns 500 when Cloudinary returns no URL for the video", async () => {
        uploadToCloudinary.mockResolvedValue({ public_id: "Mindora/broken" });

        const res = await publish(accessToken)
            .field("title", "Broken Upload")
            .field("description", "No url returned")
            .attach("videoFile", MP4, "video.mp4");

        expect(res.status).toBe(500);
        expect(res.body.message).toBe("Error uploading video");
        await expect(Video.countDocuments()).resolves.toBe(0);
    });

    it("returns 500 when the thumbnail upload returns no URL", async () => {
        uploadToCloudinary
            .mockResolvedValueOnce(cloudinaryAsset({ url: "https://cdn.test/video.mp4" }))
            .mockResolvedValueOnce({ public_id: "Mindora/broken-thumb" });

        const res = await publish(accessToken)
            .field("title", "Broken Thumb")
            .field("description", "No thumb url")
            .attach("videoFile", MP4, "video.mp4")
            .attach("thumbnail", PNG, "thumb.png");

        expect(res.status).toBe(500);
        expect(res.body.message).toBe("Error uploading thumbnail");
    });

    it("requires authentication", async () => {
        const res = await request(app)
            .post("/api/v1/videos")
            .field("title", "Anon")
            .field("description", "Anon upload")
            .attach("videoFile", MP4, "video.mp4");

        expect(res.status).toBe(401);
    });

    it("notifies every subscriber when a video is published", async () => {
        const subscriberOne = await User.create({
            username: "sub1",
            email: "sub1@example.com",
            fullName: "Sub One",
            avatar: "https://example.com/a.png",
            password: "password123",
        });
        const subscriberTwo = await User.create({
            username: "sub2",
            email: "sub2@example.com",
            fullName: "Sub Two",
            avatar: "https://example.com/b.png",
            password: "password123",
        });
        await Subscription.create({ subscriber: subscriberOne._id, channel: owner._id });
        await Subscription.create({ subscriber: subscriberTwo._id, channel: owner._id });

        const res = await publish(accessToken)
            .field("title", "Fan-out Video")
            .field("description", "Should notify subscribers")
            .attach("videoFile", MP4, "video.mp4");

        expect(res.status).toBe(201);

        const notifications = await Notification.find({ type: "NEW_VIDEO" });
        expect(notifications).toHaveLength(2);
        expect(notifications.map((n) => n.recipient.toString()).sort()).toEqual(
            [subscriberOne._id.toString(), subscriberTwo._id.toString()].sort(),
        );
        expect(notifications[0].message).toContain("Upload Owner");
        expect(notifications[0].message).toContain("Fan-out Video");
    });

    it("creates no notifications when the channel has no subscribers", async () => {
        const res = await publish(accessToken)
            .field("title", "Lonely Video")
            .field("description", "Nobody subscribed")
            .attach("videoFile", MP4, "video.mp4");

        expect(res.status).toBe(201);
        await expect(Notification.countDocuments()).resolves.toBe(0);
    });
});

describe("PATCH /api/v1/videos/:videoId — update", () => {
    let video;

    beforeEach(async () => {
        video = await Video.create({
            videoFile: "https://cdn.test/video.mp4",
            thumbnail: "https://cdn.test/old-thumb.jpg",
            title: "Original title",
            description: "Original description",
            duration: 30,
            owner: owner._id,
        });
    });

    it("updates title and description without touching Cloudinary when no thumbnail is sent", async () => {
        const res = await request(app)
            .patch(`/api/v1/videos/${video._id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .field("title", "Updated title")
            .field("description", "Updated description");

        expect(res.status).toBe(200);

        const persisted = await Video.findById(video._id);
        expect(persisted.title).toBe("Updated title");
        expect(persisted.description).toBe("Updated description");
        expect(persisted.thumbnail).toBe("https://cdn.test/old-thumb.jpg");
        expect(uploadToCloudinary).not.toHaveBeenCalled();
        expect(deleteFromCloudinary).not.toHaveBeenCalled();
    });

    // KNOWN BUG (video.controller.js:311). The await binds to the wrong expression:
    //     await uploadToCloudinary(...).url   reads .url off the Promise -> undefined
    // It should be:
    //     (await uploadToCloudinary(...)).url
    // Because the new URL comes back undefined, Mongoose drops the field and keeps the
    // OLD url -- but the old asset was already deleted from Cloudinary a few lines above.
    // Net effect: a 200 "success" that permanently breaks the video's thumbnail and
    // orphans the freshly uploaded one. `it.failing` passes while the bug is present and
    // will start failing the moment someone fixes it, prompting this to flip to `it`.
    it.failing("stores the newly uploaded thumbnail URL", async () => {
        uploadToCloudinary.mockResolvedValue(
            cloudinaryAsset({ url: "https://cdn.test/new-thumb.png" }),
        );

        await request(app)
            .patch(`/api/v1/videos/${video._id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .field("title", "Updated title")
            .field("description", "Updated description")
            .attach("thumbnail", PNG, "thumb.png");

        const persisted = await Video.findById(video._id);
        expect(persisted.thumbnail).toBe("https://cdn.test/new-thumb.png");
    });

    it("deletes the old thumbnail from Cloudinary when a new one is uploaded", async () => {
        // Documents the deletion that makes the bug above destructive: by the time the
        // upload result is (mis)read, the old asset is already gone.
        uploadToCloudinary.mockResolvedValue(
            cloudinaryAsset({ url: "https://cdn.test/new-thumb.png" }),
        );

        await request(app)
            .patch(`/api/v1/videos/${video._id}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .field("title", "Updated title")
            .field("description", "Updated description")
            .attach("thumbnail", PNG, "thumb.png");

        expect(deleteFromCloudinary).toHaveBeenCalledWith("old-thumb");
    });
});
