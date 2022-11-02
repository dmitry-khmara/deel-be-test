const { Job, Profile, Contract, JobPaymentError } = require("../src/models")

describe("Pay for a job", () => {

    it("Should deduct a balance from the client, add it to the contractor, mark the job as paid and set the paid date", () => {
        const client = Profile.build({ id: 1, balance: 1000 });
        const contractor = Profile.build({ id: 2, balance: 1500 });

        const contract = Contract.build({
            id: 1
        });

        contract.Client = client;
        contract.Contractor = contractor;

        const job = Job.build({
            id: 1,
            price: 300,
            paid: false,
        });

        job.Contract = contract;

        job.pay(client);

        expect(client.balance).toBeCloseTo(700, 9);
        expect(contractor.balance).toBeCloseTo(1800, 9);
        expect(job.paid).toBe(true);
        expect(new Date().getTime() - job.paymentDate.getTime()).toBeLessThan(1000);
    });

    it("Should throw an error if client's balance is not sufficient to pay", () => {
        const client = Profile.build({ id: 1, balance: 1000 });
        const contractor = Profile.build({ id: 2, balance: 1500 });

        const contract = Contract.build({
            id: 1
        });

        contract.Client = client;
        contract.Contractor = contractor;

        const job = Job.build({
            id: 1,
            price: 1100,
            paid: false,
        });

        job.Contract = contract;

        const pay = () => job.pay(client);

        expect(pay).toThrow(new JobPaymentError("Insufficient balance"));
    });

    it("Should throw an error if the job has already been paid", () => {
        const client = Profile.build({ id: 1, balance: 1000 });
        const contractor = Profile.build({ id: 2, balance: 1500 });

        const contract = Contract.build({
            id: 1
        });

        contract.Client = client;
        contract.Contractor = contractor;

        const job = Job.build({
            id: 1,
            price: 1100,
            paid: true,
        });

        job.Contract = contract;

        const pay = () => job.pay(client);

        expect(pay).toThrow(new JobPaymentError("Job has already been paid for"));
    });

})