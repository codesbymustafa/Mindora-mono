import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Subscription } from "../models/subscription.model.js";
import { Like } from "../models/like.model.js";
import { Notification } from "../models/notification.model.js";

const createTweet = asyncHandler(async (req, res) => {
    
    const {content } = req.body 
    const userId = req.user._id;

    if(!(await User.findById(userId))){
        throw new ApiError(404, "User not found")
    }
    
    try {
        
        const tweet = await Tweet.create({owner: userId, content})

        const channel = await User.findById(userId);
        const channelName = channel?.fullName || "A channel";
    
        const subscriberIds = await Subscription.distinct
        ("subscriber", {
          channel: userId,
        });
    
        const notifications = subscriberIds.map((subscriberId) => ({
          recipient: subscriberId,
          sender: tweet.owner,
          type: "NEW_TWEET",
          message: `${channelName} just tweeted"`,
          relatedTweet: tweet._id,
        }));
    
        await Notification.insertMany(notifications);

        res.status(201).json(new ApiResponse(201, 
            tweet , "Tweet created successfully"))

    } catch (error) {
        throw new ApiError(500, "Error creating tweet" , error)
    }

})

const getUserTweets = asyncHandler(async (req, res) => {

    const {userId} = req.params

    if(!(await User.findById(userId))){
        throw new ApiError(404, "User not found")
    }

    try {
        const tweets = await Tweet.find({owner: userId}).sort({createdAt: -1});

        const ownerDetails = await User.findById(tweets).select("_id fullName username avatar");

        res.status(200).json(new ApiResponse(200, 
            tweets , "User tweets fetched successfully"))
    } catch (error) {
        throw new ApiError(500, "Error fetching user tweets" , error)
    }

})

const updateTweet = asyncHandler(async (req, res) => {
  
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

const getAllTweets = asyncHandler(async (req, res) => {

    const tweets = await Tweet.find().sort({createdAt: -1});

    res.status(200).json(new ApiResponse(200, 
        tweets , "All tweets fetched successfully"))
})

const getTweetById = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    try {
        const tweet = await Tweet.findById(tweetId).lean();

        if (!tweet) {
            throw new ApiError(404, "Tweet not found");
        }

        const [owner, likes, likedDoc] = await Promise.all([
            User.findById(tweet.owner).select("_id fullName username avatar").lean(),
            Like.countDocuments({ tweet: tweet._id }),
            Like.exists({ tweet: tweet._id, likedBy: req.user._id }),
        ]);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        ...tweet,
                        owner,
                        likes,
                        isLikedByUser: Boolean(likedDoc),
                    },
                    "Tweet fetched successfully"
                )
            );
    } catch (error) {
        throw new ApiError(500, error.message);
    }
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet,
    getAllTweets,
    getTweetById
}
