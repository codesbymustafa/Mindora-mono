import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required : true
    },
    // Type of notification
    type: {
      type: String,
      enum: [
        "VIDEO_LIKE",        // Someone liked your video
        "TWEET_LIKE",        // Someone liked your tweet
        "COMMENT_LIKE",      // Someone liked your comment

        "NEW_VIDEO",         // Channel you subscribed to uploaded a video
        "NEW_TWEET",         // Channel you subscribed to uploaded a tweet

        "VIDEO_COMMENT",     // Someone commented on your video
        "NEW_SUBSCRIBER",    // Someone subscribed to your channel
      ],
      required: true,
    },
    // Human-readable message
    message: {
      type: String,
      required: true,
      maxlength: 500,
    },

    // Reference to related content (polymorphic)
    relatedVideo: {
      type: Schema.Types.ObjectId,
      ref: "Video",
    },
    relatedComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    relatedTweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet",
    },
    
    // Read status
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    
  },
  { timestamps: true }
);

// Compound index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

// Auto-delete notifications older than 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

export const Notification = mongoose.model("Notification", notificationSchema);