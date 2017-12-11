const {cloneDeep} = require('lodash/lang');

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