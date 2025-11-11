import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  if (!Video.findById(videoId)) {
    // return res.status(400).json({ message: "Invalid videoId" });
    throw new ApiError(400, "Invalid videoId");
  }

  // Parse and validate query params
  const rawPage = parseInt(req.query.page || "1", 10);
  const rawLimit = parseInt(req.query.limit || "10", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit =
    Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 100) : 10;

  const totalComments = await Comment.countDocuments({ video : videoId });
  if (totalComments === 0) {
    return res.json({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      data: [],
    });
  }

  const skip = totalComments < page * limit ? 0 : (page - 1) * limit;

  const agg = await Comment.aggregate([
    { $match: { video: new mongoose.Types.ObjectId(videoId) } },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        metadata: [
          { $count: "total" },
          { $addFields: { page: page, limit: limit } },
        ],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
  ]);

  const result = agg[0] || { metadata: [], data: [] };
  const total = (result.metadata[0] && result.metadata[0].total) || 0;
  const totalPages = Math.ceil(total / limit);

  return res.status(201).json(
    new ApiResponse(201, "comments fetched succesfully", {
      page,
      limit,
      total,
      totalPages,
      data: result.data,
    })
  );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const { videoId } = req.params;

  const { content, userId } = req.body;

  if (!(await Video.findById(videoId))) {
    // return res.status(400).json({ message: "Invalid videoId" });
    throw new ApiError(400, "Invalid videoId");
  }

  if (!(await User.findById(userId))) {
    // return res.status(400).json({ message: "Invalid UserId" });
    throw new ApiError(400, "Invalid userId");
  }

  if (content.trim().length === 0) {
    throw new ApiError(400, "Comment content cannot be empty");
  }

  try {
    const newComment = new Comment({
      content,
      video: videoId,
      owner: userId,
    });

    await newComment.save();

    return res
      .status(201)
      .json(new ApiResponse(201, "Comment added successfully", newComment));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment

  const { commentId } = req.params;

  const { newContent } = req.body;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  if (newContent.trim().length === 0) {
    throw new ApiError(400, "Comment content cannot be empty");
  }

  try {
    comment.content = newContent;
    await comment.save();

    return res
      .status(200)
      .json(new ApiResponse(200, "Comment updated successfully", comment));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment

  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  try {
    await Comment.findByIdAndDelete(commentId);

    return res
      .status(200)
      .json(new ApiResponse(200, "Comment deleted successfully", null));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const usersComments = asyncHandler(async (req, res) => {
  // TODO: delete a comment

  const {userId}  = req.params;

  if (!User.findById(userId)) {
    // return res.status(400).json({ message: "Invalid UserId" });
    throw new ApiError(400, "Invalid userId");
  }

  // console.log("User ID:", userId);

  try {
    const comments = await Comment.find({ owner: userId });
    // console.log(comments);
    return res
      .status(200)
      .json(
        new ApiResponse(200, comments , "User's comments fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
  usersComments,
};
