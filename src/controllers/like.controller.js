import mongoose, {Aggregate, isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    const {videoId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    if(!(await Video.findById(videoId))){
        throw new ApiError(404, "Video not found")
    }

    const existingLike = await Like.findOne({likedBy: userId, video: videoId})

    if(existingLike){
        // Unlike the video
        await Like.findByIdAndDelete(existingLike._id)

        return res.status(200).json(new ApiResponse(true, "Video unliked successfully"))
    }

    await Like.create({likedBy: userId, video: videoId})

    const totalLikes = await Like.countDocuments({video: videoId})

    return res.status(200).json(new ApiResponse(true, "Video liked successfully", {totalLikes}))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId = req.user._id

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    if(!(await Comment.findById(commentId))){
        throw new ApiError(404, "Comment not found")
    }

    const existingLike = await Like.findOne({likedBy: userId, comment: commentId})

    if(existingLike){
        // Unlike the video
        await Like.findByIdAndDelete(existingLike._id)

        return res.status(200).json(new ApiResponse(true, "Comment unliked successfully"))
    }

    await Like.create({likedBy: userId, comment: commentId})

    const totalLikes = await Like.countDocuments({comment: commentId})

    return res.status(200).json(new ApiResponse(true, "Comment liked successfully", {totalLikes}))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId = req.user._id

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet ID")
    }

    if(!(await Tweet.findById(tweetId))){
        throw new ApiError(404, "Tweet not found")
    }

    const existingLike = await Like.findOne({likedBy: userId, tweet: tweetId})

    if(existingLike){
        // Unlike the video
        await Like.findByIdAndDelete(existingLike._id)

        return res.status(200).json(new ApiResponse(true, "Tweet unliked successfully"))
    }

    await Like.create({likedBy: userId, tweet: tweetId})

    const totalLikes = await Like.countDocuments({tweet: tweetId})

    return res.status(200).json(new ApiResponse(true, "Tweet liked successfully", {totalLikes}))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const userId = req.user._id

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user ID")
    }

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $ne: null }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            }
        },
        {
            $unwind: "$videoDetails"
        },
        {
            $replaceRoot: { newRoot: "$videoDetails" }
        }
    ])

    return res.status(200).json(new ApiResponse(true, "Liked videos fetched successfully", {likedVideos}))

})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}