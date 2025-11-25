import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const channelId = req.user._id;

    //subscribers count
    const subscribersCount = await Subscription.countDocuments({ channel: channelId });

    //total videos count
    const totalVideosCount = await Video.countDocuments({ owner: channelId });

    //total views count
    const totalViewsAggregation = await Video.aggregate([
        { $match: { owner: new mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);

    const totalViewsCount = totalViewsAggregation.length > 0 ? totalViewsAggregation[0].totalViews : 0;

    //total likes count
    const totalLikesAggregation = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        { $unwind: "$videoDetails" },
        { $match: { "videoDetails.owner": new mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalLikes: { $sum: 1 } } }
    ]);

    const totalLikesCount = totalLikesAggregation.length > 0 ? totalLikesAggregation[0].totalLikes : 0;

    const stats = {
        subscribersCount,
        totalVideosCount,
        totalViewsCount,
        totalLikesCount
    };

    res.status(200).json(new ApiResponse(200, "Channel stats fetched successfully", stats));

})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const channelId = req.user._id;

    if(!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    if (!(await User.findById(channelId))) {
        throw new ApiError(404, "Channel not found");
    }

    const videos = await Video.find({ owner: channelId }).sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, "Channel videos fetched successfully", videos));
})

export {
    getChannelStats, 
    getChannelVideos
    }