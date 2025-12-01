import mongoose, {Aggregate, isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import {Notification} from "../models/notification.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoLikes = asyncHandler(async (req, res) => {

    const {videoId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const existingLike = await Like.findOne({likedBy: userId, video: videoId})

    const isLikedbyUser = !!existingLike
     
    const totalLikes = await Like.countDocuments({video: videoId})

    return res.status(200).json(new ApiResponse(true, {totalLikes , isLikedbyUser}, "Video likes fetched successfully"))

})

const getCommentLikes = asyncHandler(async (req, res) => {

    const {commentId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    const existingLike = await Like.findOne({likedBy: userId, comment: commentId})

    const isLikedbyUser = !!existingLike

    const totalLikes = await Like.countDocuments({comment: commentId})

    return res.status(200).json(new ApiResponse(true, {totalLikes , isLikedbyUser}, "Comment likes fetched successfully"))

})

const getTweetLikes = asyncHandler(async (req, res) => {

    const {tweetId} = req.params

    const userId = req.user._id

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet ID")
    }

    const existingLike = await Like.findOne({likedBy: userId, tweet: tweetId})

    const isLikedbyUser = !!existingLike

    const totalLikes = await Like.countDocuments({tweet: tweetId})

    return res.status(200).json(new ApiResponse(true, {totalLikes , isLikedbyUser}, "Tweet likes fetched successfully"))

})

const toggleVideoLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on video
    const {videoId} = req.params
    const userId = req.user._id

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const videoInfo = await Video.findById(videoId)

    if(!videoInfo){
        throw new ApiError(404, "Video not found")
    }

    const existingLike = await Like.findOne({likedBy: userId, video: videoId})

    if(existingLike){
        // Unlike the video
        await Like.findByIdAndDelete(existingLike._id)

        const totalLikes = await Like.countDocuments({video: videoId})

        return res.status(200).json(new ApiResponse(true, {totalLikes , isLikedbyUser: false}, "Video unliked successfully" ))
    }

    // Don't notify yourself
    if (videoInfo.owner.toString() !== userId.toString()) {
        await Notification.create({
            recipient: videoInfo.owner,
            sender : userId,
            type: "VIDEO_LIKE",
            message: `Someone liked your video "${videoInfo.title}"`,
            relatedVideo: videoId,
        })
    }

    await Like.create({likedBy: userId, video: videoId})

    const totalLikes = await Like.countDocuments({video: videoId})

    return res.status(200).json(new ApiResponse(true, {totalLikes , isLikedbyUser: true}, "Video liked successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId = req.user._id

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    const commentInfo = await Comment.findById(commentId)

    if(!commentInfo){
        throw new ApiError(404, "Comment not found")
    }

    const existingLike = await Like.findOne({likedBy: userId, comment: commentId})

    if(existingLike){
        // Unlike the video
        await Like.findByIdAndDelete(existingLike._id)

        const totalLikes = await Like.countDocuments({comment: commentId})

        return res.status(200).json(new ApiResponse(true, {totalLikes , isLikedbyUser: false}, "Comment unliked successfully" ))
    }

    // Don't notify yourself
    if (commentInfo.owner.toString() !== userId.toString()) {
        const videoId = commentInfo.video
        const videoInfo = await Video.findById(videoId)

        await Notification.create({
            recipient: commentInfo.owner,
            sender : userId,
            type: "COMMENT_LIKE",
            message: `Someone liked your comment on video "${videoInfo?.title || 'a video'}"`,
            relatedVideo: videoId,
            relatedComment: commentId,
        })
    }

    await Like.create({likedBy: userId, comment: commentId})

    const totalLikes = await Like.countDocuments({comment: commentId})

    return res.status(200).json(new ApiResponse(true, {totalLikes , isLikedbyUser: true}, "Comment liked successfully"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    const userId = req.user._id

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet ID")
    }

    const tweetInfo = await Tweet.findById(tweetId)

    if(!tweetInfo){
        throw new ApiError(404, "Tweet not found")
    }

    const existingLike = await Like.findOne({likedBy: userId, tweet: tweetId})

    if(existingLike){
        // Unlike the video
        await Like.findByIdAndDelete(existingLike._id)

        const totalLikes = await Like.countDocuments({tweet: tweetId})

        return res.status(200).json(new ApiResponse(true, {totalLikes , isLikedbyUser: false}, "Tweet unliked successfully" ))
    }

    // Don't notify yourself
    if (tweetInfo.owner.toString() !== userId.toString()) {
        await Notification.create({
            recipient: tweetInfo.owner,
            sender: userId,
            type: "TWEET_LIKE",
            message: `Someone liked your recent tweet`,
            relatedTweet: tweetId,
        })
    }

    await Like.create({likedBy: userId, tweet: tweetId})

    const totalLikes = await Like.countDocuments({tweet: tweetId})

    return res.status(200).json(new ApiResponse(true, {totalLikes , isLikedbyUser: true}, "Tweet liked successfully"))
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
            $set: {
                "videoDetails.views": {
                    $size: { 
                        $ifNull: [
                            "$videoDetails.views", 
                            []
                        ]
                    }
                }
            }
        },
        {
            $replaceRoot: { newRoot: "$videoDetails" }
        }
    ])

    return res.status(200).json(new ApiResponse(true, {likedVideos}, "Liked videos fetched successfully"))

})

export {
    getCommentLikes,
    getTweetLikes,
    getVideoLikes,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}