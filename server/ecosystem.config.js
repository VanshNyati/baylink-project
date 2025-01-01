module.exports = {
    apps: [
        {
            name: "baylink-server",
            script: "npm",
            args: "start",
            env: {
                NODE_ENV: "development",
                PORT: 5000,
                MONGODB_URI: "your_mongodb_uri_here", // Replace with your actual MongoDB URI
            },
            env_production: {
                NODE_ENV: "production",
                PORT: 5000,
                MONGODB_URI: "your_production_mongodb_uri_here", // Replace with your production MongoDB URI
            },
        },
    ],
};