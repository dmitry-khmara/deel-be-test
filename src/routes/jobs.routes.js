const express = require('express');
const jobsController = require('../controllers/jobs.controller');
const { getProfile } = require('../middleware/getProfile');

const router = express.Router();

router.get('/unpaid', getProfile, jobsController.listUnpaidJobs);
router.post('/:id/pay', getProfile, jobsController.payForJob);

module.exports = router;