module.exports = {
    apps: [
        {
            name: "baylink-server",
            script: "server.js",
            env: {
                NODE_ENV: "production",
                PORT: 80,
                MONGODB_URI: "mongodb+srv://vanshnyati17:Z79PI5jGdTaxmoVO@baylink-project.i4w3g.mongodb.net/baylink",
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                AWS_REGION: ap-south-1,
                S3_BUCKET_NAME: s3image-baylink,
            },
        },
    ],
};