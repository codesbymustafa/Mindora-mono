import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  //TODO: create playlist
  const userId = req.user._id;

  if (!(isValidObjectId(userId))) {
    throw new ApiError(400, "Invalid user ID");
  }
  if (!(await User.findById(userId))) {
    throw new ApiError(404, "User not found");
  }

  if (name.trim() === "") {
    throw new ApiError(400, "Playlist name cannot be empty");
  }
  if (description.trim() === "") {
    throw new ApiError(400, "Playlist description cannot be empty");
  }

  const newPlaylist = {
    name,
    description,
    owner: userId,
    videos: [],
  };

  const playlist = await Playlist.create(newPlaylist);

  res
    .status(201)
    .json(new ApiResponse(201, "Playlist created successfully", playlist));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }
  if (!(await User.findById(userId))) {
    throw new ApiError(404, "User not found");
  }

  const playlists = await Playlist.find({ owner: userId }).sort({
    createdAt: -1,
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, "User playlists fetched successfully", playlists)
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist ID");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) throw new ApiError(404, "Playlist not found");

  const ids = Array.isArray(playlist.videos) ? playlist.videos : [];
  if (ids.length === 0) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { ...playlist, videos: [] },
          "Playlist fetched successfully"
        )
      );
  }

  // fetch all videos in one query
  const videosFound = await Video.find({ _id: { $in: ids } })
    .select("title thumbnail duration owner createdAt") // adjust projection as needed
    .lean();

  // preserve playlist order without using map: iterate ids and push matches into a plain array
  const orderedVideos = [];
  for (const vidId of ids) {
    const vidIdStr = vidId.toString();
    const match = videosFound.find((v) => v._id.toString() === vidIdStr);
    if (match) orderedVideos.push(match);
  }

  const playlistWithVideos = { ...playlist, videos: orderedVideos };
  return res
    .status(200)
    .json(
      new ApiResponse(200, playlistWithVideos, "Playlist fetched successfully")
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if(!(await Video.findById(videoId))) {
    throw new ApiError(404, "Video not found");
  }

  // Check if video is already in the playlist
  if (playlist.videos.includes(videoId)) {
    throw new ApiError(400, "Video already in playlist");
  }

  playlist.videos.push(videoId);
  await playlist.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, "Video added to playlist successfully", playlist)
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if(!(await Video.findById(videoId))) {
    throw new ApiError(404, "Video not found");
  }

  // Check if video is in the playlist
  const videoIndex = playlist.videos.indexOf(videoId);
  if (videoIndex === -1) {
    throw new ApiError(400, "Video not found in playlist");
  }

  playlist.videos.splice(videoIndex, 1);
  await playlist.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, "Video removed from playlist successfully", playlist)
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  await Playlist.findByIdAndDelete(playlistId);

  res.status(200).json(new ApiResponse(200, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(404, "Playlist not found");
  }

  if (name.trim() === "") {
    throw new ApiError(400, "Playlist name cannot be empty");
  }
  if (description.trim() === "") {
    throw new ApiError(400, "Playlist description cannot be empty");
  }

  playlist.name = name || playlist.name;
  playlist.description = description || playlist.description;
  await playlist.save();

  res
    .status(200)
    .json(new ApiResponse(200, "Playlist updated successfully", playlist));
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
