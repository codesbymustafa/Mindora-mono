import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadToCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  if (! (await User.findById(userId))) {
    throw new ApiError(400, "Invalid userId");
  }

  // validate numeric params
  const pageInt = Math.max(1, parseInt(page, 10) || 1);
  const limitInt = Math.max(1, Math.min(100, parseInt(limit, 10) || 10)); // cap to 100

  // allowed sort fields
  const allowedSortFields = ["title", "createdAt", "views", "duration"];
  if (!allowedSortFields.includes(sortBy)) {
    throw new ApiError(
      400,
      `Invalid sortBy. Allowed fields: ${allowedSortFields.join(", ")}`
    );
  }

  const sortDirection = String(sortType).toLowerCase() === "asc" ? 1 : -1;

  // build match
  const match = {};
  if (query) {
    const q = query.trim();
    if (q.length) {
      const regex = new RegExp(q, "i");
      match.$or = [
        { title: { $regex: regex } },
        { description: { $regex: regex } },
      ];
    }
  }

  if (userId) {
    match.owner = new mongoose.Types.ObjectId(userId);
  }

  // build pipeline
  const pipeline = [];
  if (Object.keys(match).length) pipeline.push({ $match: match });

  // populate owner
  pipeline.push(
    {
      $match: {
        owner: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $sort: {
        [sortBy]: sortDirection,
      },
    }
  );

  const aggregate = Video.aggregate(pipeline);

  const result = await Video.aggregatePaginate(
    aggregate,
    {
      page: pageInt,
      limit: limitInt,
      pagination: true,
    }
  )
  .then((res) => res)
  .catch((err) => {
    throw new ApiError(500, "Error fetching videos" , err);
  });

  // console.log(aggregate);

  // return paginated result
  const data = {
    success: true,
    message: "Videos fetched successfully",
    data: result.docs,
    pagination: {
      totalDocs: result.totalDocs,
      limit: result.limit,
      page: result.page,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage,
    }
  }
  return res.status(200).json(
    new ApiResponse( 200 , "Videos fetched successfully", 
      data)
    );

});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
//   console.log("DEBUG req.files:", req.files);
//   console.log("DEBUG req.body:", req.body);

  if (!title) throw new ApiError(400, "Title is required");
  if (!description) throw new ApiError(400, "Description is required");

  let videoFile;
  let thumbnail;
  if (Array.isArray(req.files)) {
    videoFile = req.files.find((f) => f.fieldname === "videoFile");
    thumbnail = req.files.find((f) => f.fieldname === "thumbnail");
  } else {
    videoFile = req.files?.videoFile?.[0];
    thumbnail = req.files?.thumbnail?.[0];
  }

  if (!videoFile) throw new ApiError(400, "Video file is required");
  if (!thumbnail) throw new ApiError(400, "Thumbnail file is required");

  console.log("all files checked");

  let uploadedVideo;
  let uploadedThumbnail;

  // upload video to cloudinary
  if (videoFile.path) {
    
      uploadedVideo = await uploadToCloudinary(videoFile.path, "videos");
      
      if(!uploadedVideo || !uploadedVideo.url)
      throw new ApiError(500, "Error uploading video");

      console.log("video Uploaded");
    }

  if (thumbnail.path) {
    
      uploadedThumbnail = await uploadToCloudinary(thumbnail.path, "thumbnail");
      
      if(!uploadedThumbnail || !uploadedThumbnail.url){
          throw new ApiError(500, "Error uploading thumbnail");
        }
        
        console.log("Thumbnail uploaded");
  }

  try {
    const newVideo = await Video.create({
      videoFile: uploadedVideo.url,
      thumbnail: uploadedThumbnail.url,
      title,
      description,
      duration : uploadedVideo.duration || 0,
      owner: req.user._id,
    });

    const createdVideo = await Video.findById(newVideo._id);

    if (!createdVideo) {
      throw new ApiError(500, "Error creating video record");
    }

    return res
      .status(201)
      .json(
        new ApiResponse( 201 ,"Video published successfully", createdVideo)
      );
  } catch (error) {
    if (uploadedVideo) {
      deleteFromCloudinary(uploadedVideo.public_id);
      console.log("Deleted uploaded video due to error");
    }
    if (uploadedThumbnail) {
      deleteFromCloudinary(uploadedThumbnail.public_id);
      console.log("Deleted uploaded thumbnail due to error");
    }
    console.error("Error creating video record", error);
    throw new ApiError(500, "Error creating video record");
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  return res
    .status(200)
    .json(new ApiResponse( 201 ,"Video fetched successfully", video));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const { title, description } = req.body;

  if (title.trim() === "" || description.trim() === "") {
    // video.title = title.trim();
    throw new ApiError(400, "Title and description cannot be empty");
  }

  const thumbnailFile = req.file;
  let newThumbnail = video.thumbnail;

  if (thumbnailFile) {
    try {
      const oldPublicId = newThumbnail.split("/").pop().split(".")[0]; // extract public_id from URL

      try {
        await deleteFromCloudinary(oldPublicId);
      } catch (error) {
        console.error("Error deleting old thumbnail from Cloudinary", error);
      }

      newThumbnail = await uploadToCloudinary(thumbnailFile.path, "thumbnails")
        .url;
    } catch (error) {
      console.error("Error uploading thumbnail to Cloudinary", error);
      throw new ApiError(500, "Error uploading thumbnail");
    }
  }

  try {
    const newVideoData = await Video.findByIdAndUpdate(
      videoId,
      {
        title: title || video.title,
        description: description || video.description,
        thumbnail: newThumbnail,
      },
      { new: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse( 201 ,"Video updated successfully", newVideoData)
      );
  } catch (error) {
    throw new ApiError(500, "Error updating video details");
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const thumbnail = video.thumbnail;
  const videoFile = video.videoFile;

  try {
    const publicIdThumbnail = thumbnail.split("/").pop().split(".")[0]; // extract public_id from URL
    const publicIdVideo = videoFile.split("/").pop().split(".")[0]; // extract public_id from URL

    console.log("img id ", publicIdThumbnail);
    console.log("video id ", publicIdVideo);

   
      const thumbnailResult = await deleteFromCloudinary(publicIdThumbnail , "image");

      if(!thumbnailResult)throw new Error("Failed to delete thumbnail from Cloudinary");
    
      const vidResult = await deleteFromCloudinary(publicIdVideo , "video");

      if(!vidResult)throw new Error("Failed to delete video from Cloudinary");



  } catch (error) {
    console.error("Error deleting files from Cloudinary", error);
  }
  try {
    await Video.findByIdAndDelete(videoId);

    return res
      .status(200)
      .json(new ApiResponse( 201 ,"Video deleted successfully", null));
  } catch (error) {
    throw new ApiError(500, "Error deleting video");
  }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  try {
    video.isPublished = !video.isPublished;
    await video.save();

    return res
      .status(200)
      .json(
        new ApiResponse( 201 ,
          `Video ${video.isPublished ? "published" : "unpublished"} successfully`,
          video
        )
      );
  } catch (error) {
    throw new ApiError(500, "Error toggling publish status");
  }
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
