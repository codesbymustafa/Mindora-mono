import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  // TODO: toggle subscription
  const { channelId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channelId");
  }

  if (!(await User.findById(channelId))) {
    throw new ApiError(404, "Channel not found");
  }

  const existingSubscription = await Subscription.findOne({
    subscriber: userId,
    channel: channelId,
  });

  if (existingSubscription) {
    // unsubscribe
    await Subscription.findByIdAndDelete(existingSubscription._id);

    return res
      .status(200)
      .json(new ApiResponse(200, "Unsubscribed successfully"));
  } else {
    // subscribe
    const newSubscription = await Subscription.create({
      subscriber: userId,
      channel: channelId,
    });

    await newSubscription.save();

    return res
      .status(201)
      .json(new ApiResponse(201, "Subscribed successfully"));
  }
});

// controller to return subscriber list of a channel
const getChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!(await User.findById(channelId))) {
    throw new ApiError(404, "Channel not found");
  }

  if (channelId !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "Access denied. You can only view your own channel subscribers."
    );
  }

  const subscribers = await Subscription.aggregate([
    { $match: { channel: new mongoose.Types.ObjectId(channelId) } },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberInfo",
      },
    },
    { $unwind: { path: "$subscriberInfo", preserveNullAndEmptyArrays: false } },
    {
      $project: {
        _id: 0 ,
        name: "$subscriberInfo.username",
        email: "$subscriberInfo.email",
        avatar: "$subscriberInfo.avatar",
        subscribedAt: "$createdAt",
      },
    },
    { $sort: { subscribedAt: -1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Channel subscribers fetched successfully", {
      totalSubscribers: subscribers.length,
      subscribers,
    })
  );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!(await User.findById(subscriberId))) {
    throw new ApiError(404, "User not found");
  }

  const subscriptions = await Subscription.aggregate([
    { $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) } },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channelInfo",
      },
    },
    {
      $unwind: {
        path: "$channelInfo",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $project: {
        _id: 0,
        name: "$channelInfo.username",
        avatar: "$channelInfo.avatar",
        subscribedAt: "$createdAt",
      },
    },
    { $sort: { subscribedAt: -1 } },
  ]);

  return res.status(200).json(
    new ApiResponse(200, "Subscribed channels fetched successfully", {
      totalSubscriptions: subscriptions.length,
      subscriptions,
    })
  );
});

export { toggleSubscription, getChannelSubscribers, getSubscribedChannels };
