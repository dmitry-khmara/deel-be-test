const Sequelize = require('sequelize');
const getStorageConfig = require('./storageConfig');

const sequelize = new Sequelize(getStorageConfig());

function ClientDepositError(message) {
  this.name = "ProfileDepositError";
  this.message = message;
}

class Profile extends Sequelize.Model {

  deposit(amount) {

    if (amount <= 0)
      throw new ClientDepositError("Cannot deposit a negative amount");

    const totalOwed = this.ClientContracts.reduce(
      (prev, cur) => prev +
        cur.Jobs.reduce((prev, cur) => prev + cur.paid ? 0 : cur.price, 0), 0);

    if (amount > totalOwed * 0.25)
      throw new ClientDepositError("Cannot deposit more than 25% of owed for jobs");

    this.balance += amount;
  }
}
Profile.init(
  {
    firstName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    lastName: {
      type: Sequelize.STRING,
      allowNull: false
    },
    profession: {
      type: Sequelize.STRING,
      allowNull: false
    },
    balance: {
      type: Sequelize.DECIMAL(12, 2)
    },
    type: {
      type: Sequelize.ENUM('client', 'contractor')
    }
  },
  {
    sequelize,
    modelName: 'Profile'
  }
);

class Contract extends Sequelize.Model {
}
Contract.init(
  {
    terms: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    status: {
      type: Sequelize.ENUM('new', 'in_progress', 'terminated')
    }
  },
  {
    sequelize,
    modelName: 'Contract'
  }
);

function JobPaymentError(message) {
  this.name = "JobPaymentError";
  this.message = message;
}

JobPaymentError.prototype = Object.create(Error.prototype);

class Job extends Sequelize.Model {
  pay(client) {
    if (client !== this.Contract.Client)
      throw new JobPaymentError("Only the job's client can pay for the job");

    if (this.paid)
      throw new JobPaymentError("Job has already been paid for")

    if (client.balance < this.price)
      throw new JobPaymentError("Insufficient balance");

    this.Contract.Client.balance -= this.price;
    this.Contract.Contractor.balance += this.price;

    this.paid = true;
    this.paymentDate = new Date();
  }


}
Job.init(
  {
    description: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    price: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false
    },
    paid: {
      type: Sequelize.BOOLEAN,
      default: false
    },
    paymentDate: {
      type: Sequelize.DATE
    }
  },
  {
    sequelize,
    modelName: 'Job'
  }
);

Profile.hasMany(Contract, { as: 'ContractorContracts', foreignKey: 'ContractorId' })
Contract.Contractor = Contract.belongsTo(Profile, { as: 'Contractor' })
Profile.hasMany(Contract, { as: 'ClientContracts', foreignKey: 'ClientId' })
Contract.Client = Contract.belongsTo(Profile, { as: 'Client' })
Contract.hasMany(Job)
Job.Contract = Job.belongsTo(Contract)

module.exports = {
  sequelize,
  Profile,
  ClientDepositError,
  Contract,
  Job,
  JobPaymentError
};
