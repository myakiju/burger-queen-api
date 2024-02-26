const bcrypt = require('bcrypt');

const {
  requireAuth,
  requireAdmin,
} = require('../middleware/auth');

const {
  getUsers,
  createUser,
} = require('../controller/users');

const initAdminUser = (app, next) => {
  const { adminEmail, adminPassword } = app.get('config');
  if (!adminEmail || !adminPassword) {
    return next();
  }

  const adminUser = {
    email: adminEmail,
    password: bcrypt.hashSync(adminPassword, 10),
    roles: { admin: true },
  };

  // TODO: Create admin user
  // First, check if adminUser already exists in the database
  // If it doesn't exist, it needs to be saved

  next();
};

/** @module users */
module.exports = (app, next) => {
  /**
   * @name GET /users
   * @description List users
   * @path {GET} /users
   * @query {String} [_page=1] Page of the list to consult
   * @query {String} [_limit=10] Number of elements per page
   * @auth Requires authentication `token` and the user to be an **admin**
   * @response {Array} users
   * @response {String} users[].id
   * @response {Object} users[].email
   * @response {String} users[].role. Role: 'admin' or 'waiter' or 'chef'
   * @code {200} if authentication is correct
   * @code {401} if there is no authentication header
   * @code {403} if the user is not an admin
   */
  app.get('/users', requireAdmin, getUsers);

  /**
   * @name GET /users/:uid
   * @description Get information about a user
   * @path {GET} /users/:uid
   * @params {String} :uid User's `id` or `email` to query
   * @auth Requires authentication `token` and the user to be an **admin** or the user being queried
   * @response {Object} user
   * @response {String} user.id
   * @response {Object} user.email
   * @response {String} user.role. Role: 'admin' or 'waiter' or 'chef'
   * @code {200} if authentication is correct
   * @code {401} if there is no authentication header
   * @code {403} if the user is not an admin or the same user
   * @code {404} if the requested user does not exist
   */
  app.get('/users/:uid', requireAuth, (req, resp) => {
  });

  /**
   * @name POST /users
   * @description Create a user
   * @path {POST} /users
   * @body {String} email Email
   * @body {String} password Password
   * @body {Object} [roles]
   * @body {Boolean} [roles.admin]
   * @auth Requires authentication `token` and the user to be an **admin**
   * @response {Object} user
   * @response {String} user.id
   * @response {Object} user.email
   * @response {String} user.role. Role: 'admin' or 'waiter' or 'chef'
   * @code {200} if authentication is correct
   * @code {400} if `email` or `password` are not provided or both
   * @code {401} if there is no authentication header
   * @code {403} if a user with that `email` already exists
   */
  app.post('/users', createUser);

  /**
   * @name PUT /users/:uid
   * @description Modify a user
   * @params {String} :uid User's `id` or `email` to modify
   * @path {PUT} /users/:uid
   * @body {String} email Email
   * @body {String} password Password
   * @body {Object} [roles]
   * @body {Boolean} [roles.admin]
   * @auth Requires authentication `token` and user to be an **admin** or the user being modified
   * @response {Object} user
   * @response {String} user.id
   * @response {Object} user.email
   * @response {String} user.role. Role: 'admin' or 'waiter' or 'chef'
   * @code {200} if authentication is correct
   * @code {400} if `email` or `password` are not provided or both
   * @code {401} if there is no authentication header
   * @code {403} if the user is not an admin or the same user
   * @code {403} if a non-admin user tries to modify their `roles`
   * @code {404} if the requested user does not exist
   */
  app.put('/users/:uid', requireAuth, (req, resp, next) => {
  });

  /**
   * @name DELETE /users/:uid
   * @description Delete a user
   * @params {String} :uid User's `id` or `email` to delete
   * @path {DELETE} /users/:uid
   * @auth Requires authentication `token` and the user to be an **admin** or the user being deleted
   * @response {Object} user
   * @response {String} user.id
   * @response {Object} user.email
   * @response {String} user.role. Role: 'admin' or 'waiter' or 'chef'
   * @code {200} if authentication is correct
   * @code {401} if there is no authentication header
   * @code {403} if the user is not an admin or the same user
   * @code {404} if the requested user does not exist
   */
  app.delete('/users/:uid', requireAuth, (req, resp, next) => {
  });

  initAdminUser(app, next);
};
