import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Notification } from "../models/notification.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  
  const { videoId } = req.params;
    if (!(await Video.findById(videoId))) {
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
    return res.status(201).json(
      new ApiResponse(201, {
        page,
        limit,
        total: 0,
        totalPages: 0,
        result: [],
      },
      "comments fetched succesfully"
    )
    );
  }

  const skip = totalComments < page * limit ? 0 : (page - 1) * limit;

  const currentUserId = new mongoose.Types.ObjectId(req.user._id);

  const agg = await Comment.aggregate([
    { $match: { video: new mongoose.Types.ObjectId(videoId) } },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        metadata: [
          { $count: "total" },
          { $addFields: { page: page, limit: limit } },
        ],
        data: [
          { $skip: skip },
          { $limit: limit },
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                { $project: { _id: 1, fullName: 1, username: 1, avatar: 1 } },
              ],
            },
          },
          { $addFields: { owner: { $first: "$owner" } } },
          {
            $lookup: {
              from: "likes",
              localField: "_id",
              foreignField: "comment",
              as: "likes",
            },
          },
          {
            $addFields: {
              likes: { $size: { $ifNull: ["$likes", []] } },
              isLikedByUser: {
                $in: [
                  currentUserId,
                  {
                    $map: {
                      input: { $ifNull: ["$likes", []] },
                      as: "l",
                      in: "$$l.likedBy",
                    },
                  },
                ],
              },
            },
          },
          {
            $project: {
              content: 1,
              video: 1,
              owner: 1,
              likes: 1,
              isLikedByUser: 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ],
      },
    },
  ]);

  const result = agg[0] || { metadata: [], data: [] };
  const total = (result.metadata[0] && result.metadata[0].total) || 0;
  const totalPages = Math.ceil(total / limit);

  return res.status(201).json(
    new ApiResponse(201, {
      page,
      limit,
      total,
      totalPages,
      result: result.data,
    },
    "comments fetched succesfully"
  )
  );
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video

  const { videoId } = req.params;
  const userId = req.user._id;
  const { content } = req.body;

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

    const videoInfo = await Video.findById(videoId);

    await Notification.create({
      recipient: videoInfo.owner ,
      sender: userId,
      type: "VIDEO_COMMENT",
      message: `Someone commented on your video "${videoInfo?.title}"`,
      relatedComment: newComment._id,
      relatedVideo: videoId,
    })

    return res
      .status(201)
      .json(new ApiResponse(201 , newComment , "Comment added successfully"));
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

  if(comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }

  if (newContent.trim().length === 0) {
    throw new ApiError(400, "Comment content cannot be empty");
  }

  try {
    comment.content = newContent;
    await comment.save();

    return res
      .status(200)
      .json(new ApiResponse(200,comment, "Comment updated successfully" ));
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

  if(comment.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this comment");
  }

  try {
    await Comment.findByIdAndDelete(commentId);

    return res
      .status(200)
      .json(new ApiResponse(200,null ,  "Comment deleted successfully"));
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

const usersComments = asyncHandler(async (req, res) => {
  const userId  = req.user._id;

  if (!User.findById(userId)) {
    // return res.status(400).json({ message: "Invalid UserId" });
    throw new ApiError(400, "Invalid userId");
  }

  // logger.info("User ID:", userId);

  try {
    const comments = await Comment.find({ owner: userId });
    // logger.info(comments);
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
