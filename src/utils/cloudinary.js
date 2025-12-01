import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
import logger from "./logger.js";

dotenv.config()
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    logger.info("file uploaded successfully", result.url);

    fs.unlinkSync(filePath);
    return result;
  } catch (error) {
    console.error("Error uploading file to Cloudinary", error);
    fs.unlinkSync(filePath);
    return null;
  }
};

const deleteFromCloudinary = async (publicId , type) => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId , { resource_type: type });
    logger.info("file deleted successfully from Cloudinary", result);
    return result.result != 'not found';

  } catch (error) {
    console.error("Error deleting file from Cloudinary", error);
    return null;
  }
}

export { uploadToCloudinary , deleteFromCloudinary };
