function getStorageConfig() {
    return {
        dialect: 'sqlite',
        storage: './database.sqlite3'
    }
}

module.exports = getStorageConfig;