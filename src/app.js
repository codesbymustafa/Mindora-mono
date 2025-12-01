import express from "express";
import cors from "cors";
import cookieParser  from 'cookie-parser'
import morgan from "morgan";
import logger from "./utils/logger.js";

const app = express();

const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        if(process.env.NODE_ENV !== 'TEST')
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);


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
import tweetRoutes from "./routes/tweet.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import playlistRoutes from "./routes/playlist.routes.js";
import likeRoutes from "./routes/like.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

// Using routes

app.use("/api/v1/healthcheck", healthCheckRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/tweets", tweetRoutes);
app.use("/api/v1/subscriptions", subscriptionRoutes);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1/like", likeRoutes);
app.use("/api/v1/like", likeRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

export {app}