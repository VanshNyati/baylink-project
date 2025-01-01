module.exports = {
    apps: [
        {
            name: "baylink-server",
            script: "server.js",
            env: {
                NODE_ENV: "production",
                PORT: 5000,
                MONGODB_URI: process.env.MONGODB_URI,
                AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
                AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
                S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
            },
        },
    ],
};