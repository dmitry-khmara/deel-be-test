const express = require('express');
const balancesController = require('../controllers/balances.controller');

const router = express.Router();

router.post('/deposit/:id', balancesController.depositClientFunds);

module.exports = router;