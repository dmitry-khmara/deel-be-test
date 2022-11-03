const { ClientDepositError } = require("../models/index");

const depositClientFunds = async (req, res) => {
    const { Contract, Profile, Job } = req.app.get('models')
    const { id } = req.params

    const { amount } = req.body;

    const client = await Profile.findOne({
        where: {
            id
        },
        include: [{
            model: Contract,
            as: 'ClientContracts',
            include: [{ model: Job }]
        }]
    })

    if (!client) return res.status(404).end();

    try {
        client.deposit(amount);
    }
    catch (err) {
        if (err instanceof ClientDepositError)
            return res.status(400).json({ error: err.message }).end();

        return res.status(500).end();
    }

    client.save();

    return res.status(200).end();
}

module.exports = {
    depositClientFunds
}