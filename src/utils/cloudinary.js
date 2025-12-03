import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import logger from "./logger.js";
import streamifier from "streamifier";


dotenv.config()
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const options = {
  folder : "Mindora",
  resource_type: "auto",
}

const uploadToCloudinary = async (fileBuffer) => {
  
  if(!fileBuffer) return null;

  return new Promise((resolve, reject) => {

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
            logger.error("Cloudinary upload failed", error);
            return reject(error);
        }
        
        logger.info("Cloudinary upload success", result.url);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  })
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
