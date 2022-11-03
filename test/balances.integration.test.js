const request = require("supertest");
const app = require("../src/app");
const { useInMemoryTestDb, initializeTestDbTables } = require('./integrationTestsDbHelpers');
const { Job, Profile, Contract } = require("../src/models")

jest.setTimeout(30000);

useInMemoryTestDb();

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

describe("Deposit client balance", () => {

    beforeEach(async () => await initializeTestDbTables());

    it("Should add the specified sum to the client's balance", async () => {
        const client = { ...profileWithId1, balance: 1000 };
        const contractor = { ...profileWithId2, balance: 1500 };

        await Profile.create(client);
        await Profile.create(contractor);

        const contract = {
            id: 1,
            terms: 'self service',
            status: 'in_progress',
            ClientId: client.id,
            ContractorId: contractor.id
        };

        const job = {
            id: 1,
            description: 'work',
            price: 800,
            paid: false,
            ContractId: contract.id,
        };

        await Contract.create(contract);
        await Job.create(job);

        const response = await request(app)
            .post("/balances/deposit/1")
            .send({ amount: 120 });

        expect(response.statusCode).toBe(200);

        const updatedClient = await Profile.findByPk(client.id);

        expect(updatedClient.balance).toBeCloseTo(1120, 9);
    });

    it("Should return an error if client tries to deposit over 25% of total owed for jobs", async () => {
        const client = { ...profileWithId1, balance: 1000 };
        const contractor = { ...profileWithId2, balance: 1500 };

        await Profile.create(client);
        await Profile.create(contractor);

        const contract = {
            id: 1,
            terms: 'self service',
            status: 'in_progress',
            ClientId: client.id,
            ContractorId: contractor.id
        };

        const job = {
            id: 1,
            description: 'work',
            price: 300,
            paid: false,
            ContractId: contract.id,
        };

        await Contract.create(contract);
        await Job.create(job);

        const response = await request(app)
            .post("/balances/deposit/1")
            .send({ amount: 120 });

        expect(response.statusCode).toBe(400);

        expect(response.body.error).toBe("Cannot deposit more than 25% of owed for jobs");
    });
})