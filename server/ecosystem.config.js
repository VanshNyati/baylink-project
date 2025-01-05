module.exports = {
    apps: [
        {
            name: "baylink-server",
            script: "server.js",
            env: {
                NODE_ENV: "production",
                PORT: 80,
                MONGODB_URI: "mongodb+srv://vanshnyati17:Z79PI5jGdTaxmoVO@baylink-project.i4w3g.mongodb.net/baylink",
                AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
                AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
                S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
            },
        },
    ],
};