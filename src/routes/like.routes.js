import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getCommentLikes,
    getTweetLikes,
    getVideoLikes,
} from "../controllers/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/v/:videoId").post(toggleVideoLike).get(getVideoLikes);
router.route("/c/:commentId").post(toggleCommentLike).get(getCommentLikes);
router.route("/t/:tweetId").post(toggleTweetLike).get(getTweetLikes);

router.route("/videos").get(getLikedVideos);

export default router