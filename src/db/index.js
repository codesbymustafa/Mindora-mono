import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    console.log("Connecting to the database...");
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
    );

    console.log(
      `Connected to the database successfully \n Database Name: ${connectionInstance.connection.name} \n Host: ${connectionInstance.connection.host} \n Port: ${connectionInstance.connection.port}`,
    );
  } catch (err) {
    console.error("Error connecting to the database:", err);
    process.exit(1);
  }
};

export default connectDB;
