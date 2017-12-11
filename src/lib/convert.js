const {promisify} = require('util');
const converter = require('json-2-csv');

const json2csvAsync = promisify(converter.json2csv);
const csv2jsonAsync = promisify(converter.csv2json);

module.exports = {
    csv2jsonAsync,
    json2csvAsync,
};