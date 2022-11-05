const request = require("supertest");
const app = require("../src/app");
const { useInMemoryTestDb, initializeTestDbTables } = require('./integrationTestsDbHelpers');
const { Job, Profile, Contract } = require("../src/models")

jest.setTimeout(30000);

useInMemoryTestDb();

describe("Best profession", () => {

    const wizardProfile = {
        id: 1,
        firstName: 'Harry',
        lastName: 'Potter',
        profession: 'Wizard',
        balance: 1150,
        type: 'contractor'
    };

    const hackerProfile = {
        id: 2,
        firstName: 'Mr',
        lastName: 'Robot',
        profession: 'Hacker',
        balance: 231.11,
        type: 'contractor'
    };

    const clientProfile = {
        id: 3,
        firstName: 'John',
        lastName: 'Snow',
        profession: 'Knows nothing',
        balance: 451.3,
        type: 'client'
    };

    beforeEach(async () => await initializeTestDbTables());

    it("Should return the profession that earned the most during the period", async () => {

        await Profile.create(clientProfile);
        await Profile.create(wizardProfile);
        await Profile.create(hackerProfile);

        const wizardContract = {
            id: 1,
            terms: 'cast a spell',
            status: 'in_progress',
            ClientId: clientProfile.id,
            ContractorId: wizardProfile.id
        };

        const hackerContract = {
            id: 2,
            terms: 'hack a website',
            status: 'in_progress',
            ClientId: clientProfile.id,
            ContractorId: hackerProfile.id
        };

        await Contract.create(wizardContract);
        await Contract.create(hackerContract);

        async function createPaidJob(id, contract, amountPaid, paymentDate) {
            const job = {
                id: id,
                description: 'work',
                price: amountPaid,
                paid: true,
                paymentDate,
                ContractId: contract.id,
            };

            await Job.create(job);

            return job;
        }


        const wizardJobJan2 = await createPaidJob(1, wizardContract, 300, new Date(2022, 1, 2));
        const wizardJobJan4 = await createPaidJob(2, wizardContract, 500, new Date(2022, 1, 4));
        const wizardJobJan30 = await createPaidJob(3, wizardContract, 9000, new Date(2022, 1, 30));
        const hackerJobJan2 = await createPaidJob(4, hackerContract, 600, new Date(2022, 1, 2));
        const hackerJobJan5 = await createPaidJob(5, hackerContract, 700, new Date(2022, 1, 5));
        const hackerJobJan7 = await createPaidJob(6, hackerContract, 100, new Date(2022, 1, 7));

        const response = await request(app)
            .get("/admin/best-profession")
            .query({
                start: new Date(2022, 1, 2),
                end: new Date(2022, 1, 6)
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.profession).toBe("Hacker");
        expect(response.body.totalEarned).toBeCloseTo(hackerJobJan2.price + hackerJobJan5.price);
    });

    it("Should return nothing if there're no jobs", async () => {

        const response = await request(app)
            .get("/admin/best-profession")
            .query({
                start: new Date(2022, 1, 2),
                end: new Date(2022, 1, 6)
            });

        expect(response.statusCode).toBe(200);

        expect(response.body.profession).toBe(null);
        expect(response.body.totalEarned).toBeCloseTo(0);
    });
})

describe("Best clients", () => {

    beforeEach(async () => await initializeTestDbTables());

    it("Should return the list of clients who paid the most for jobs in the specified period", async () => {

        const client1Profile = {
            id: 1,
            firstName: 'Harry',
            lastName: 'Potter',
            profession: 'Wizard',
            balance: 1150,
            type: 'client'
        };

        const client2Profile = {
            id: 2,
            firstName: 'Mr',
            lastName: 'Robot',
            profession: 'Hacker',
            balance: 231.11,
            type: 'client'
        };

        const client3Profile = {
            id: 3,
            firstName: 'John',
            lastName: 'Snow',
            profession: 'Knows nothing',
            balance: 451.3,
            type: 'client'
        };

        const hackerProfile = {
            id: 4,
            firstName: 'Mr',
            lastName: 'Robot',
            profession: 'Hacker',
            balance: 231.11,
            type: 'contractor'
        };

        await Profile.create(client1Profile);
        await Profile.create(client2Profile);
        await Profile.create(client3Profile);
        await Profile.create(hackerProfile);

        const client1Contract = {
            id: 1,
            terms: 'cast a spell',
            status: 'in_progress',
            ClientId: client1Profile.id,
            ContractorId: hackerProfile.id
        };

        const client2Contract = {
            id: 2,
            terms: 'hack a website',
            status: 'in_progress',
            ClientId: client2Profile.id,
            ContractorId: hackerProfile.id
        };

        const client3Contract = {
            id: 3,
            terms: 'hack a system',
            status: 'in_progress',
            ClientId: client3Profile.id,
            ContractorId: hackerProfile.id
        };

        await Contract.create(client1Contract);
        await Contract.create(client2Contract);
        await Contract.create(client3Contract);

        async function createPaidJob(id, contract, amountPaid, paymentDate) {
            const job = {
                id: id,
                description: 'work',
                price: amountPaid,
                paid: true,
                paymentDate,
                ContractId: contract.id,
            };

            await Job.create(job);

            return job;
        }

        const client1Job1 = await createPaidJob(1, client1Contract, 300, new Date(2022, 1, 2));
        const client1Job2 = await createPaidJob(2, client1Contract, 500, new Date(2022, 1, 4));
        const client1Job3 = await createPaidJob(3, client1Contract, 9000, new Date(2022, 1, 30));
        const client2Job1 = await createPaidJob(4, client2Contract, 600, new Date(2022, 1, 2));
        const client2Job2 = await createPaidJob(5, client2Contract, 700, new Date(2022, 1, 5));
        const client3Job1 = await createPaidJob(6, client3Contract, 100, new Date(2022, 1, 6));

        const response = await request(app)
            .get("/admin/best-clients")
            .query({
                start: new Date(2022, 1, 2),
                end: new Date(2022, 1, 6),
                limit: 3
            });

        expect(response.statusCode).toBe(200);

        expect(response.body).toEqual(expect.arrayContaining([
            expect.objectContaining({
                id: client2Profile.id,
                fullName: client2Profile.firstName + " " + client2Profile.lastName,
                paid: client2Job1.price + client2Job2.price
            }),
            expect.objectContaining({
                id: client1Profile.id,
                fullName: client1Profile.firstName + " " + client1Profile.lastName,
                paid: client1Job1.price + client1Job2.price
            }),
            expect.objectContaining({
                id: client3Profile.id,
                fullName: client3Profile.firstName + " " + client3Profile.lastName,
                paid: client3Job1.price
            })
        ]));
    });
})