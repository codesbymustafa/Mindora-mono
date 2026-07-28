// Unit tests for the Cloudinary helper itself.
// The integration suites mock this module at the boundary, so its own stream/error
// handling was never exercised. Here the Cloudinary SDK is mocked instead, letting
// the helper's real logic run against a fake uploader.
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { Writable } from "stream";

const uploadStream = jest.fn();
const destroy = jest.fn();

jest.unstable_mockModule("cloudinary", () => ({
    v2: {
        config: jest.fn(),
        uploader: { upload_stream: uploadStream, destroy },
    },
}));

const { uploadToCloudinary, deleteFromCloudinary } = await import(
    "../src/utils/cloudinary.js"
);

// Stands in for the SDK's upload_stream: collects the piped bytes, then hands the
// caller's callback either a result or an error once the stream closes.
const fakeUploader = ({ result, error }) => (options, callback) => {
    const chunks = [];
    return new Writable({
        write(chunk, _enc, next) {
            chunks.push(chunk);
            next();
        },
        final(done) {
            const received = Buffer.concat(chunks);
            if (error) callback(error, undefined);
            else callback(undefined, { ...result, received });
            done();
        },
    });
};

beforeEach(() => {
    uploadStream.mockReset();
    destroy.mockReset();
});

describe("uploadToCloudinary", () => {
    it("resolves with the Cloudinary result and streams the whole buffer", async () => {
        uploadStream.mockImplementation(
            fakeUploader({ result: { url: "https://cdn.test/x.png", public_id: "Mindora/x" } }),
        );

        const buffer = Buffer.from("some-image-bytes");
        const result = await uploadToCloudinary(buffer);

        expect(result.url).toBe("https://cdn.test/x.png");
        expect(result.public_id).toBe("Mindora/x");
        // The bytes that reached the uploader are byte-for-byte what we passed in.
        expect(result.received.equals(buffer)).toBe(true);
    });

    it("uploads into the Mindora folder with automatic resource detection", async () => {
        uploadStream.mockImplementation(fakeUploader({ result: { url: "https://cdn.test/x.png" } }));

        await uploadToCloudinary(Buffer.from("bytes"));

        expect(uploadStream).toHaveBeenCalledTimes(1);
        expect(uploadStream.mock.calls[0][0]).toMatchObject({
            folder: "Mindora",
            resource_type: "auto",
        });
    });

    it("returns null without calling Cloudinary when the buffer is missing", async () => {
        await expect(uploadToCloudinary(undefined)).resolves.toBeNull();
        await expect(uploadToCloudinary(null)).resolves.toBeNull();
        expect(uploadStream).not.toHaveBeenCalled();
    });

    it("rejects when Cloudinary reports an upload error", async () => {
        uploadStream.mockImplementation(fakeUploader({ error: new Error("upload failed") }));

        await expect(uploadToCloudinary(Buffer.from("bytes"))).rejects.toThrow("upload failed");
    });
});

describe("deleteFromCloudinary", () => {
    it("returns null without calling Cloudinary when no publicId is given", async () => {
        await expect(deleteFromCloudinary(undefined)).resolves.toBeNull();
        expect(destroy).not.toHaveBeenCalled();
    });

    it("returns true when the asset is destroyed", async () => {
        destroy.mockResolvedValue({ result: "ok" });

        await expect(deleteFromCloudinary("Mindora/x")).resolves.toBe(true);
        expect(destroy).toHaveBeenCalledWith("Mindora/x", { resource_type: undefined });
    });

    it("forwards the resource type when one is supplied", async () => {
        destroy.mockResolvedValue({ result: "ok" });

        await deleteFromCloudinary("Mindora/clip", "video");

        expect(destroy).toHaveBeenCalledWith("Mindora/clip", { resource_type: "video" });
    });

    it("returns false when Cloudinary reports the asset was not found", async () => {
        destroy.mockResolvedValue({ result: "not found" });

        await expect(deleteFromCloudinary("Mindora/missing")).resolves.toBe(false);
    });

    it("swallows SDK errors and returns null", async () => {
        // Deletion is best-effort cleanup: a failure here must never surface to the caller.
        destroy.mockRejectedValue(new Error("network down"));

        await expect(deleteFromCloudinary("Mindora/x")).resolves.toBeNull();
    });
});
