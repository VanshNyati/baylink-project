module.exports = {
    apps: [
        {
            name: "baylink-server",
            script: "server.js",
            env: {
                NODE_ENV: "production",
                PORT: 80,
                MONGODB_URI: "mongodb+srv://vanshnyati17:Z79PI5jGdTaxmoVO@baylink-project.i4w3g.mongodb.net/baylink",
                AWS_ACCESS_KEY_ID: AKIAWX2IFNYJJDGQM6WO,
                AWS_SECRET_ACCESS_KEY: b7YN / L1Braxhay4VLKF5Xqk2EN39f4NnCZ3j8yMu,
                AWS_REGION: ap-south-1,
                S3_BUCKET_NAME: s3image-baylink,
            },
        },
    ],
};