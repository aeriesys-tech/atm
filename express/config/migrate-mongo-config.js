require('dotenv').config();

module.exports = {
    mongodb: {
        url: process.env.MONGODB_URI,     // Uses the URI from .env
        databaseName: 'test',         // 🔁 Make sure this is exactly 'atm-test'
        options: {}
    },
    migrationsDir: "migrations",
    changelogCollectionName: "changelog"
};
