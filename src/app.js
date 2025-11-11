import express from "express";
import cors from "cors";
import cookieParser  from 'cookie-parser'

const app = express();

app.use(cors({
    origin : process.env.CORS_ORIGIN ,
    credentials : true
}));

// Middleware to parse JSON and URL-encoded data
app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cookieParser());

// Importing routes

import healthCheckRoutes from "./routes/healthcheck.routes.js";
import userRoutes from "./routes/user.routes.js";
import videoRoutes from "./routes/video.routes.js";
import commentRoutes from "./routes/comment.routes.js";

// Using routes

app.use("/api/v1/healthcheck", healthCheckRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/comments", commentRoutes);

export {app}