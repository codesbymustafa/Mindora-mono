import multer from 'multer'
import fs from 'fs'
import path from 'path';
import logger from '../utils/logger.js';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    logger.info("file gotten in multer" );
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.
    // logger.info("file got " , file);
    round(Math.random() * 1E9)
    cb(null, uniqueSuffix + file.originalname)
  }
})

const upload = multer({ storage: storage , limits
: { fileSize: 100 * 1024 * 1024 }
})

export default upload;