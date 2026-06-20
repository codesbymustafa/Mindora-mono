import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";
import mongoose, { isValidObjectId } from "mongoose";
import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";
import fs from "fs";
import { log } from "console";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Token generation failed");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password } = req.body;

  if (!username || !fullName || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  if (
    [fullName, username, email, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  const avatarPath = req.files?.avatar?.[0].buffer;
  const coverImagePath = req.files?.coverImage?.[0].buffer;

  if (existedUser) {
    if (avatarPath) fs.unlinkSync(avatarPath);
    if (coverImagePath) fs.unlinkSync(coverImagePath);
    throw new ApiError(409, "User already exists");
  }
  console.warn("files ", req.files);

  let avatar = {};

  if (avatarPath) {
    try {
      avatar = await uploadToCloudinary(avatarPath);
      logger.info("avatar uploaded", avatar);
    } catch (error) {
      console.error("Error uploading avatar to Cloudinary", error);
      throw new ApiError(500, "Error uploading avatar");
    }
  }

  let coverImage = {};

  if (coverImagePath) {
    try {
      coverImage = await uploadToCloudinary(coverImagePath);
      logger.info("coverImage uploaded", coverImage);
    } catch (error) {
      console.error("Error uploading cover image to Cloudinary", error);
    }
  }

  try {
    const user = await User.create({
      fullName,
      username: username.toLowerCase(),
      email,
      avatar: avatar?.url,
      coverImage: coverImage?.url || "",
      password,
    });

    const createdUser = await User.findById(user._id).select(
      "-password -refreshaToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "User creation failed");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User created successfully"));
  } catch (error) {
    if (avatar) {
      deleteFromCloudinary(avatar.public_id);
      logger.info("deleted avatar from cloudinary");
    }
    if (coverImage) {
      deleteFromCloudinary(coverImage.public_id);
      logger.info("deleted cover image from cloudinary");
    }

    console.error("Error creating user", error);
    throw new ApiError(500, "User creation failed");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  if ((!email && !username) || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!loggedInUser) {
    throw new ApiError(500, "Login failed");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "Login successful"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await User.findByIdAndUpdate(userId, {
    $unset: {
      refreshToken: 1, // this removes the field from document
    },
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decoded = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (!decoded || !decoded._id) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const user = await User.findById(decoded._id).select("-password");

    if (!user || user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refresh token invalid or expired");
    }

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            newRefreshToken,
            user,
          },
          "Token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "Invalid or expired refresh token"
    );
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "All fields are required");
  }

  if (oldPassword.trim() === "" || newPassword.trim() === "") {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }],
    _id: { $ne: req.user._id },
  }); // exclude current user

  if (existedUser) {
    throw new ApiError(409, "Email already in use by another account");
  }

  const newUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true }
  ).select("-password -refreshToken");

  if (!newUser) {
    throw new ApiError(500, "Could not update user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newUser, "User updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarPath = req.file?.buffer;

  if (!avatarPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadToCloudinary(avatarPath);

  if (!avatar) {
    throw new ApiError(500, "Could not upload avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!user) {
    deleteFromCloudinary(avatar.public_id);
    throw new ApiError(500, "Could not update avatar");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const CoverImagePath = req.file?.buffer;

  if (!CoverImagePath) {
    throw new ApiError(400, "Cover Image file is required");
  }

  //delete old cover image from cloudinary

  const oldUser = await User.findById(req.user?._id);

  if (!oldUser) {
    throw new ApiError(404, "User not found");
  }

  if (oldUser.coverImage) {
    await deleteFromCloudinary(oldUser.coverImage);
  }

  const CoverImage = await uploadToCloudinary(CoverImagePath);

  if (!CoverImage) {
    throw new ApiError(500, "Could not upload Cover Image");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: CoverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!user) {
    deleteFromCloudinary(CoverImage.public_id);
    throw new ApiError(500, "Could not update Cover Image");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username) {
    throw new ApiError(400, "User ID is required");
  }

  const channel = await User.aggregate([
    {
      $match: { username: username?.toLowerCase() },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channelId",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new ApiError(404, "channel does not exists");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
          {
            $addFields: {
              views: { $size: { $ifNull: ["$views", []] } },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});

const addToWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Video ID is required");
  }

  if (!(await Video.findById(videoId))) {
    throw new ApiError(404, "Video not found");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //remove videoId if already exists
  user.watchHistory = user.watchHistory.filter(
    (id) => id.toString() !== videoId
  );

  //add videoId to the beginning
  user.watchHistory.unshift(videoId);

  await user.save({ validateBeforeSave: false });

  logger.info("Updated watch history: ", user.watchHistory);

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "Video added to watch history successfully")
    );
});

const toggleTheme = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        prefferedTheme: req.user.prefferedTheme === "light" ? "dark" : "light",
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  if (!user) {
    throw new ApiError(500, "Could not toggle theme");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { prefferedTheme: user.prefferedTheme },
        "Theme toggled successfully"
      )
    );
});

const getTheme = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { prefferedTheme: req.user.prefferedTheme },
        "Theme fetched successfully"
      )
    );
});

const getUserById = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  const user = await User.findById(userId).select(
    "username fullName avatar coverImage"
  );
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User fetched successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  refreshAccessToken,
  getUserChannelProfile,
  getWatchHistory,
  addToWatchHistory,
  toggleTheme,
  getTheme,
  getUserById,
};
