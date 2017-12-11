const cloneDeep = require('lodash.clonedeep');

async function validateConfig(unvalidatedConfig) {

  // not found
  // return;

  // Invalid
  // return false;

  // Invalid
  // return {
  //   validated: false
  // }

  const config = cloneDeep(unvalidatedConfig);
  
  // Do validation logic here

  config.validated = true; 
  
  return config;
}

module.exports = {
  validateConfig
};