const getContractById = async (req, res) => {
    const { Contract } = req.app.get('models')
    const { Op } = require("sequelize");
    const { id } = req.params

    const contract = await Contract.findOne({
        where: {
            id,
            [Op.or]: [
                { contractorId: req.profile.id },
                { clientId: req.profile.id },
            ]
        }
    })

    if (!contract) return res.status(404).end()

    res.json(contract)
}

const listContracts = async (req, res) => {
    const { Contract } = req.app.get('models')
    const { Op } = require("sequelize");

    const contracts = await Contract.findAll({
        where: {
            status: ['new', 'in_progress'],
            [Op.or]: [
                { contractorId: req.profile.id },
                { clientId: req.profile.id },
            ]
        }
    })

    res.json(contracts)
}

module.exports = {
    getContractById,
    listContracts
}