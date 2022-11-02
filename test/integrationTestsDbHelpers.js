const { Profile, Contract, Job } = require('../src/models');

function useInMemoryTestDb() {
    jest.mock('../src/models/storageConfig', () => {
        return jest.fn().mockImplementation(() => ({
            dialect: 'sqlite',
            storage: ':memory:'
        }))
    });
}

async function initializeTestDbTables() {
    await Profile.sync({ force: true });
    await Contract.sync({ force: true });
    await Job.sync({ force: true });
}

module.exports = {
    useInMemoryTestDb,
    initializeTestDbTables
}