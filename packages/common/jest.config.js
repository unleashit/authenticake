const globalJestConfig = require('../../.config/jestBaseConfig');

module.exports = {
  ...globalJestConfig,
  roots: ['src'],
};
