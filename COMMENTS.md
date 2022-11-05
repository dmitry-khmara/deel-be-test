# Comments to DEEL BACKEND TASK

Apart from implementing the functional API requirements, I have made changes to two areas of the codebase: code structure and tests.

## 1. Code Structure

I have separated the code responsible for coordination, business, and infrastructure logic into multiple files. This lowered the code coupling and allowed for higher maintainability.

### 1.1. Controllers 

I have separated the related coordination logic of the endpoints into separate controllers. Controllers are named after a subdomain or an entity and are placed under the `/controllers` folder. Each function in controller is responsible for reading the request, fetching and saving data, interacting with the domain model, and forming the response.

The following controllers currently exists:
- [balances.controller.js](https://github.com/dmitry-khmara/deel-be-test/blob/master/src/controllers/balances.controller.js)
- [contracts.controller.js](https://github.com/dmitry-khmara/deel-be-test/blob/master/src/controllers/contracts.controller.js)
- [jobs.controller.js](https://github.com/dmitry-khmara/deel-be-test/blob/master/src/controllers/jobs.controller.js)
- [admin.controller.js](https://github.com/dmitry-khmara/deel-be-test/blob/master/src/controllers/admin.controller.js)

### 1.2. Routes

Routes are solely responsible for routing requests for each subdomain or an entity. Routing is an infrastructure concern and should be separate.

The following routers currently exist:
- [balances.routes.js](https://github.com/dmitry-khmara/deel-be-test/blob/master/src/routes/balances.routes.js)
- [contracts.routes.js](https://github.com/dmitry-khmara/deel-be-test/blob/master/src/routes/contracts.routes.js) 
- [jobs.routes.js](https://github.com/dmitry-khmara/deel-be-test/blob/master/src/routes/jobs.routes.js) 
- [admin.routes.js](https://github.com/dmitry-khmara/deel-be-test/blob/master/src/routes/admin.routes.js) 

### 1.3. Business Logic

I have placed certain business logic into entities, instead of keeping it in controllers or placing it into some stand-alone service. Placing logic in the entities allows for higher cohesion. It also allows to easily unit test such logic. 

The examples are:
- Depositing client funds: this is done by the `deposit` function in the `Profile` class.
- Paying for a job: this is done by a `pay` function in the `Job` class.

## 2. Testing

I have created a set of unit and integration tests to cover both business and coordination logic.

Jest is used as a testing framework. Just uses two projects configured in package.json, to distinguish between unit and integration tests, since unit and integration tests use different test runners.

Test can be run using `npm run test` command.

### 2.1. Unit tests

These are the tests that test business logic. They don't require any setup and can be run in paraller. Unit tests are named using the following scheme: `*.unit.test.js`. 

Examples:
- [balances.unit.test.js](https://github.com/dmitry-khmara/deel-be-test/blob/master/test/balances.unit.test.js)
- [jobs.unit.test.js](https://github.com/dmitry-khmara/deel-be-test/blob/master/test/jobs.unit.test.js)

### 2.2. Integration tests

These are end-to-end tests that create an in-memory web server which connects to an in-memory Sqlite database. Each test populates the database with the data to be run on. Since these tests share the same DB, they are run sequentially. Integration tests allow for testing of the whole flow, which includes routing and parsing an HTTP request, calling a database, and returning a response. Such tests are named using the following scheme: `*.integration.test.js`. 

Examples:
- [balances.integration.test.js](https://github.com/dmitry-khmara/deel-be-test/blob/master/test/balances.integration.test.js)
- [jobs.integration.test.js](https://github.com/dmitry-khmara/deel-be-test/blob/master/test/jobs.integration.test.js)
- [contracts.integration.test.js](https://github.com/dmitry-khmara/deel-be-test/blob/master/test/contracts.integration.test.js)
- [admin.integration.test.js](https://github.com/dmitry-khmara/deel-be-test/blob/master/test/admin.integration.test.js)

## 3. Further points of improvement

My next step would be to add Typescript. That would allow to check for compile-time type errors which can reduce the amount of the application runtime bugs.