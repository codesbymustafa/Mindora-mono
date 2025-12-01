import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import logger from "../utils/logger.js";

const connectDB = async () => {
  try {
    logger.info("Connecting to the database...");
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
    );

    logger.info(
      `Connected to the database successfully \n Database Name: ${connectionInstance.connection.name} \n Host: ${connectionInstance.connection.host} \n Port: ${connectionInstance.connection.port}`,
    );
  } catch (err) {
    logger.error("Error connecting to the database:", err);
    process.exit(1);
  }
};

export default connectDB;
