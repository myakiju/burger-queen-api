const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const config = require('../config');
const authMiddleware = require('../middleware/auth');
const errorHandler = require('../middleware/error');
const routes = require('../routes');
const pkg = require('../package.json');
const { connect } = require('../connect');

const { port, secret } = config;
const app = express();
// const router = express.Router();

// app.use('/.netlify/functions/api', router);

app.use(cors());
app.set('config', config);
app.set('pkg', pkg);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(authMiddleware(secret));

connect();

routes(app, (err) => {
  if (err) {
    throw err;
  }

  app.use(errorHandler);

  app.listen(port, () => {
    console.info(`App listening on port ${port}`);
  });
});

module.exports.handler = serverless(app);
