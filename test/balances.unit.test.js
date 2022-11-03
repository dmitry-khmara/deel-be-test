const { Job, Profile, Contract, ClientDepositError } = require("../src/models")

describe("Deposit client balance", () => {

    it("Should add the specified sum to the client's balance", () => {
        const client = Profile.build({ id: 1, balance: 1000 });
        const contractor = Profile.build({ id: 2, balance: 1500 });

        const contract = Contract.build({
            id: 1
        });

        client.ClientContracts = [contract];

        contract.Client = client;
        contract.Contractor = contractor;

        const job = Job.build({
            id: 1,
            price: 800,
            paid: false,
        });

        contract.Jobs = [job];

        job.Contract = contract;

        client.deposit(120);

        expect(client.balance).toBeCloseTo(1120, 9);
    });

    it("Should throw an error if the client tries to deposit a negative amount", () => {
        const client = Profile.build({ id: 1, balance: 1000 });
        const contractor = Profile.build({ id: 2, balance: 1500 });

        const contract = Contract.build({
            id: 1
        });

        client.ClientContracts = [contract];

        contract.Client = client;
        contract.Contractor = contractor;

        const job = Job.build({
            id: 1,
            price: 300,
            paid: false,
        });

        contract.Jobs = [job];

        job.Contract = contract;

        const deposit = () => client.deposit(-98);

        expect(deposit).toThrow(new ClientDepositError("Cannot deposit a negative amount"));
    });

    it("Should throw an error if the specified amount is greater than 25% of owed jobs", () => {
        const client = Profile.build({ id: 1, balance: 1000 });
        const contractor = Profile.build({ id: 2, balance: 1500 });

        const contract = Contract.build({
            id: 1
        });

        client.ClientContracts = [contract];

        contract.Client = client;
        contract.Contractor = contractor;

        const job = Job.build({
            id: 1,
            price: 300,
            paid: false,
        });

        contract.Jobs = [job];

        job.Contract = contract;

        const deposit = () => client.deposit(76); // 1 over the limit of 75 (.25 of 300)

        expect(deposit).toThrow(new ClientDepositError("Cannot deposit more than 25% of owed for jobs"));
    });

})