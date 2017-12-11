const { parseConfig } = require('./parseConfig');
const { validateConfig } = require('./validateConfig');
const { checkPermissions } = require('./checkPermissions');
const { upsertRepositories } = require('./upsertRepositories');

module.exports = {
  parseConfig,
  validateConfig,
  checkPermissions,
  upsertRepositories
}