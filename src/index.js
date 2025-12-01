import {app} from './app.js';
import dotenv from "dotenv";
import connectDB from './db/index.js';
import logger from './utils/logger.js';


dotenv.config({
    path: './.env'
});

logger.info("Environment variables loaded from .env file");
const PORT = process.env.PORT;

connectDB()
.then(() => {
    app.listen(PORT, () => {
        if(process.env.NODE_ENV !== 'TEST')
        logger.info(`Server is running on port ${PORT}`);
    });
})
.catch(err => {
    logger.error("Failed to connect to the database:", err);
});

