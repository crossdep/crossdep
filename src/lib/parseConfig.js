const cloneDeep = require('lodash.clonedeep');

async function parseConfig(unparsedConfig) {
    // return false;

    // no version
    // return {
    //     parsed: true,
    //     config: {
            
    //     }
    // }

    // If parsed
    return {
        parsed: true,
        config: cloneDeep(unparsedConfig)
    }
  }
  
  module.exports = {
    parseConfig
  };