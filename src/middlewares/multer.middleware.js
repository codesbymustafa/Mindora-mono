import multer from 'multer'
import fs from 'fs'
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("file gotten in multer" );
    cb(null, './public/temp')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.
    // console.log("file got " , file);
    round(Math.random() * 1E9)
    cb(null, uniqueSuffix + file.originalname)
  }
})

const upload = multer({ storage: storage , limits
: { fileSize: 100 * 1024 * 1024 }
})

export default upload;