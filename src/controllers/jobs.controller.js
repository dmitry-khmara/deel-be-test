const { sequelize, JobPaymentError } = require("../models/index");

const listUnpaidJobs = async (req, res) => {
    const { Job, Contract } = req.app.get('models')
    const { Op } = require("sequelize");

    const jobs = await Job.findAll({
        where: {
            paid: false
        },
        include: [{
            model: Contract,
            where: {
                status: ['new', 'in_progress'],
                [Op.or]: [
                    { contractorId: req.profile.id },
                    { clientId: req.profile.id },
                ]
            }
        }]
    })

    res.json(jobs)
}

const payForJob = async (req, res) => {
    const { Job, Contract, Profile } = req.app.get('models')
    const { id } = req.params

    const job = await Job.findOne({
        where: {
            id
        },
        include: [{
            model: Contract,
            where: {
                clientId: req.profile.id
            },
            include: [{
                model: Profile,
                as: "Contractor",
            },
            {
                model: Profile,
                as: "Client",
            }]
        }]
    })

    if (!job)
        return res.status(404).end();

    try {
        job.pay(job.Contract.Client);
    }
    catch (err) {
        if (err instanceof JobPaymentError)
            return res.status(400).json({ error: err.message }).end();

        return res.status(500).end();
    }

    const t = await sequelize.transaction();

    try {
        await job.save({ transaction: t });
        await job.Contract.save({ transaction: t });
        await job.Contract.Client.save({ transaction: t });
        await job.Contract.Contractor.save({ transaction: t });

        await t.commit();
    }
    catch {
        await t.rollback();

        return res.status(500).end();
    }

    return res.status(200).end();
}

module.exports = {
    listUnpaidJobs,
    payForJob
}