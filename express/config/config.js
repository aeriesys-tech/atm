// config.js
require('dotenv').config();

const config = {
    port: process.env.PORT || 8080,
    mongoURI: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    email: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    aws: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        bucketName: process.env.S3_BUCKET_NAME,
    },
};

module.exports = config;
