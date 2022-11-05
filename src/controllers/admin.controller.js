const sequelize = require('sequelize');

const getBestProfession = async (req, res) => {
    const { Contract, Profile, Job } = req.app.get('models')
    const { start, end } = req.query

    const { Op } = sequelize;

    const topProfessions = await Job.findAll({
        attributes: [
            [sequelize.col('Contract.Contractor.profession'), 'profession'],
            [sequelize.fn("SUM", sequelize.col("price")), "totalEarned"],
        ],
        where: {
            paid: true,
            paymentDate: {
                [Op.gte]: new Date(start),
                [Op.lte]: new Date(end)
            }
        },
        include: [{
            model: Contract,
            include: [{ model: Profile, as: 'Contractor' }]
        }],
        group: "Contract.Contractor.profession",
        order: [
            [sequelize.fn("SUM", sequelize.col("price")), 'DESC']
        ],
        limit: 1
    })

    const topProfession = topProfessions[0];

    return res
        .status(200)
        .json({
            profession: topProfession ? topProfession.dataValues.profession : null,
            totalEarned: topProfession ? topProfession.dataValues.totalEarned : 0
        })
        .end();
}

const getBestClients = async (req, res) => {
    const { Contract, Profile, Job } = req.app.get('models')
    const { start, end } = req.query

    const limit = req.query.limit ?? 2;

    const { Op } = sequelize;

    const fullNameAttribute = sequelize.literal(`\`Contract->Client\`.\`firstName\` || ' ' || \`Contract->Client\`.\`lastName\``);

    const topClients = await Job.findAll({
        attributes: [
            [sequelize.col('Contract.Client.id'), 'id'],
            [fullNameAttribute, 'fullName'],
            [sequelize.fn("SUM", sequelize.col("price")), "paid"],
        ],
        where: {
            paid: true,
            paymentDate: {
                [Op.gte]: new Date(start),
                [Op.lte]: new Date(end)
            }
        },
        include: [{
            model: Contract,
            include: [{ model: Profile, as: 'Client' }]
        }],
        group: [sequelize.col("Contract.Client.id"), fullNameAttribute],
        order: [
            [sequelize.fn("SUM", sequelize.col("price")), 'DESC']
        ],
        limit: limit
    })

    return res
        .status(200)
        .json(topClients.map(o => ({ id: o.dataValues.id, fullName: o.dataValues.fullName, paid: o.paid })))
        .end();
}

module.exports = {
    getBestProfession,
    getBestClients
}