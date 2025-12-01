import mongoose from "mongoose";
import { Notification } from "../models/notification.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

// Get user's notifications with pagination
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  const pageInt = Math.max(1, parseInt(page, 10));
  const limitInt = Math.min(50, Math.max(1, parseInt(limit, 10)));

  const match = { recipient: new mongoose.Types.ObjectId(userId) };
  if (unreadOnly === "true") {
    match.isRead = false;
  }

  const notifications = await Notification.aggregate([
    { $match: match },
    { $sort: { createdAt: -1 } },
    { $skip: (pageInt - 1) * limitInt },
    { $limit: limitInt },
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "sender",
        pipeline: [
          { $project: { _id: 1, username: 1, fullName: 1, avatar: 1 } },
        ],
      },
    },
    { $addFields: { sender: { $first: "$sender" } } },
  ]);

  const totalCount = await Notification.countDocuments(match);
  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        unreadCount,
        pagination: {
          page: pageInt,
          limit: limitInt,
          totalDocs: totalCount,
          totalPages: Math.ceil(totalCount / limitInt),
        },
      },
      "Notifications fetched successfully"
    )
  );
});

// Mark notification(s) as read
const markAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { notificationIds } = req.body; // Array of IDs or empty for all

  const filter = { recipient: userId, isRead: false };

  if (Array.isArray(notificationIds) && notificationIds.length > 0) {
    filter._id = {
      $in: notificationIds.map((id) => new mongoose.Types.ObjectId(id)),
    };
  }

  const result = await Notification.updateMany(filter, { isRead: true });

  return res.status(200).json(
    new ApiResponse(
      200,
      { modifiedCount: result.modifiedCount },
      "Notifications marked as read"
    )
  );
});

// Delete a notification
const deleteNotification = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { notificationId } = req.params;

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Notification deleted"));
});


const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { unreadCount: count }, "Unread count fetched"));
});

export { getNotifications, markAsRead, deleteNotification, getUnreadCount };