const request = require("supertest");
const app = require("../src/app");
const { Profile, Contract, Job } = require('../src/models');


jest.setTimeout(10000);

jest.mock('../src/models/storageConfig', () => {
    return jest.fn().mockImplementation(() => ({
        dialect: 'sqlite',
        storage: ':memory:'
    }))
});

async function preparedTestDb() {
    await Profile.sync({ force: true });
    await Contract.sync({ force: true });
    await Job.sync({ force: true });
}

const profileWithId1 = {
    id: 1,
    firstName: 'Harry',
    lastName: 'Potter',
    profession: 'Wizard',
    balance: 1150,
    type: 'client'
};

const profileWithId2 = {
    id: 2,
    firstName: 'Mr',
    lastName: 'Robot',
    profession: 'Hacker',
    balance: 231.11,
    type: 'client'
};

describe("Contracts tests", () => {
    beforeEach(async () => await preparedTestDb());

    it("Should return a contract by an Id if the profile owns it", async () => {
        await Profile.create(profileWithId1)

        const contract = {
            id: 2,
            terms: 'self service',
            status: 'in_progress',
            ClientId: 1,
            ContractorId: 1
        };

        await Contract.create(contract)

        const response = await request(app)
            .get("/contracts/2")
            .set('profile_id', 1);

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(expect.objectContaining(contract));
    });

    it("Should return 404 if the contract does not exist", async () => {
        await Profile.create(profileWithId1)

        const response = await request(app)
            .get("/contracts/2")
            .set('profile_id', 1);

        expect(response.statusCode).toBe(404);
    });

    it("Should return 404 if the contract exits but does not belong to the profile", async () => {
        await Profile.create(profileWithId1)
        await Profile.create(profileWithId2)

        const contract = {
            id: 2,
            terms: 'some other contract',
            status: 'in_progress',
            ClientId: 2,
            ContractorId: 2
        };

        await Contract.create(contract)

        const response = await request(app)
            .get("/contracts/2")
            .set('profile_id', 1);

        expect(response.statusCode).toBe(404);
    });
});