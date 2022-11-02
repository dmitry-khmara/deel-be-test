const request = require("supertest");
const app = require("../src/app");
const { useInMemoryTestDb, initializeTestDbTables } = require('./integrationTestsDbHelpers');
const { Profile, Contract, Job } = require('../src/models');


jest.setTimeout(20000);

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

describe("List upaid jobs for active contracts", () => {

    beforeEach(async () => await initializeTestDbTables());

    it("Should return unpaid jobs for active contracts for this profile", async () => {
        await Profile.create(profileWithId1)
        await Profile.create(profileWithId2)

        const clientContract = {
            id: 1,
            terms: 'self service',
            status: 'in_progress',
            ClientId: profileWithId1.id,
            ContractorId: profileWithId2.id
        };

        const unpaidJobForClientContract = {
            id: 1,
            description: 'work',
            price: 2020,
            paid: false,
            ContractId: clientContract.id,
        };

        const paidJobForClientContract = {
            id: 2,
            description: 'work',
            price: 2020,
            paid: true,
            paymentDate: '2020-08-15T19:11:26.737Z',
            ContractId: clientContract.id,
        };

        const contractorContract = {
            id: 2,
            terms: 'self service',
            status: 'new',
            ClientId: profileWithId2.id,
            ContractorId: profileWithId1.id
        };

        const unpaidJobForContractorContract = {
            id: 3,
            description: 'work',
            price: 2020,
            paid: false,
            ContractId: contractorContract.id,
        };

        const contractorTerminatedContract = {
            id: 3,
            terms: 'self service',
            status: 'terminated',
            ClientId: profileWithId2.id,
            ContractorId: profileWithId1.id
        };

        const unpaidJobForContractorTerminatedContract = {
            id: 4,
            description: 'work',
            price: 2020,
            paid: false,
            ContractId: contractorTerminatedContract.id,
        };

        const someoneElsesContract = {
            id: 4,
            terms: 'self service',
            status: 'terminated',
            ClientId: profileWithId2.id,
            ContractorId: profileWithId2.id
        };

        const unpaidJobForSomeoneElsesContract = {
            id: 5,
            description: 'work',
            price: 2020,
            paid: false,
            ContractId: someoneElsesContract.id,
        };

        await Contract.create(clientContract);
        await Job.create(unpaidJobForClientContract);
        await Job.create(paidJobForClientContract);

        await Contract.create(contractorContract);
        await Job.create(unpaidJobForContractorContract);

        await Contract.create(contractorTerminatedContract);
        await Job.create(unpaidJobForContractorTerminatedContract);

        await Contract.create(someoneElsesContract);
        await Job.create(unpaidJobForSomeoneElsesContract);

        const response = await request(app)
            .get("/jobs/unpaid")
            .set('profile_id', 1);

        expect(response.statusCode).toBe(200);

        expect(response.body.length).toBe(2);
        expect(response.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining(unpaidJobForClientContract),
                expect.objectContaining(unpaidJobForContractorContract)
            ]));
    });

});

describe("Pay for a job", () => {

    beforeEach(async () => await initializeTestDbTables());

    it("Should change balances for the client and the contractor and update the job", async () => {
        const client = { ...profileWithId1, balance: 1000 };
        const contractor = { ...profileWithId2, balance: 1500 };

        await Profile.create(client)
        await Profile.create(contractor)

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
            .post("/jobs/1/pay")
            .set('profile_id', 1);

        expect(response.statusCode).toBe(200);

        const updatedJob = await Job.findByPk(job.id);
        const updatedClient = await Profile.findByPk(client.id);
        const updatedContractor = await Profile.findByPk(contractor.id);

        expect(updatedClient.balance).toBeCloseTo(700, 9);
        expect(updatedContractor.balance).toBeCloseTo(1800, 9);
        expect(updatedJob.paid).toBe(true);
    });

    it("Should return an error if the payment failed", async () => {
        const client = { ...profileWithId1, balance: 1000 };
        const contractor = { ...profileWithId2, balance: 1500 };

        await Profile.create(client)
        await Profile.create(contractor)

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
            paid: true,
            ContractId: contract.id,
        };

        await Contract.create(contract);
        await Job.create(job);

        const response = await request(app)
            .post("/jobs/1/pay")
            .set('profile_id', 1);

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe("Job has already been paid for");
    });

});