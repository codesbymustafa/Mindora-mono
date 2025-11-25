import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content } = req.body 
    const userId = req.user._id;

    if(!(await User.findById(userId))){
        throw new ApiError(404, "User not found")
    }
    
    try {
        
        const tweet = await Tweet.create({owner: userId, content})
        res.status(201).json(new ApiResponse(201, 
            tweet , "Tweet created successfully"))

    } catch (error) {
        throw new ApiError(500, "Error creating tweet" , error)
    }

})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets

    const {userId} = req.params

    if(!(await User.findById(userId))){
        throw new ApiError(404, "User not found")
    }

    try {
        const tweets = await Tweet.find({owner: userId}).sort({createdAt: -1});

        res.status(200).json(new ApiResponse(200, 
            tweets , "User tweets fetched successfully"))
    } catch (error) {
        throw new ApiError(500, "Error fetching user tweets" , error)
    }

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId} = req.params
    const {content } = req.body
    const userId = req.user._id

    const tweet = await Tweet.findById(tweetId);
    
    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }

    if(!(await User.findById(userId))){
        throw new ApiError(404, "User not found")
    }

    if(tweet.owner.equals(userId) === false){
        throw new ApiError(403, "You are not authorized to update this tweet")
    }

    try {
        const tweet = await Tweet.findByIdAndUpdate(
            tweetId,
            {content},
            {new: true}
        )

        res.status(200).json(new ApiResponse(200, 
            tweet , "Tweet updated successfully"))
        }

    catch (error) {
        throw new ApiError(500, "Error updating tweet" , error)
    }}
)
const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId} = req.params
    const userId = req.user._id

    const tweet = await Tweet.findById(tweetId);
    
    if(!tweet){
        throw new ApiError(404, "Tweet not found")
    }

    if(!(await User.findById(userId))){
        throw new ApiError(404, "User not found")
    }
    
    if(tweet.owner.equals(userId) === false){
        throw new ApiError(403, "You are not authorized to delete this tweet")
    }

    try {
        await Tweet.findByIdAndDelete(tweetId)

        res.status(200).json(new ApiResponse(200, 
            null , "Tweet deleted successfully"))
        }

    catch (error) {
        throw new ApiError(500, "Error deleting tweet" , error)
    }
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
