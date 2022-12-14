const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./models')
const contractsRoutes = require('./routes/contracts.routes');
const jobsRoutes = require('./routes/jobs.routes');
const balancesRoutes = require('./routes/balances.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(bodyParser.json());
app.set('sequelize', sequelize)
app.set('models', sequelize.models)

app.use('/contracts', contractsRoutes);
app.use('/jobs', jobsRoutes);
app.use('/balances', balancesRoutes);
app.use('/admin', adminRoutes);

module.exports = app;