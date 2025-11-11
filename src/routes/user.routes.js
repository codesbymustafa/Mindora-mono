import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

//unsecured

//  registerUser ,
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

//     loginUser ,
router.route("/login").post(loginUser);

//secured

//     logoutUser ,
router.route("/logout").post(verifyJWT, logoutUser);

//     refreshAccessToken,
router.route("/refresh-token").post(verifyJWT, refreshAccessToken);

//     changeCurrentPassword ,
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

//     getCurrentUser ,
router.route("/current-user").get(verifyJWT, getCurrentUser);

// The PATCH method is used to apply partial modifications to a resource.
// Unlike PUT, which replaces the entire resource, PATCH only updates the specified fields.

//     updateAccountDetails ,
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

//     updateUserAvatar ,
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

//     updateUserCoverImage ,
router
  .route("/cover-image")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

//     getUserChannelProfile,
router.route("/c/:username").get(verifyJWT, getUserChannelProfile);

//     getWatchHistory
router.route("history").get(verifyJWT, getWatchHistory);

export default router;
