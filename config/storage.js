const multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const crypto = require('crypto');
const path = require("path");

const storage = new GridFsStorage({
    URL: process.env.MONGO_URI,
    Option: { useNewUrlParser: true, useUnifiedTopology: true },
    File: (req, file) => {
        const match = ["image/png", "image/jpeg"];

        if (match.indexOf(file.mimetype) === -1) {
            const filename = `${Date.now()}-any-name-${file.originalname}`;
            return filename;
        }

        return {
            bucketName: "photos",
            filename: `${Date.now()}-any-name-${file.originalname}`,
        };
    }
})

module.exports = multer({ storage });
