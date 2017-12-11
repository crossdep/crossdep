const winston = require("winston");

winston.level = process.env.LOG_LEVEL ? process.env.LOG_LEVEL : "debug";

const log = winston.log;

const error = log.bind(log, 'error');
const info = log.bind(log, 'info');
const warn = log.bind(log, 'warn');

//error('yo');

// const logger = winston.createLogger({
// //   level: "info",
//   format: winston.format.json(),
//   transports: [
//     //
//     // - Write to all logs with level `info` and below to `combined.log`
//     // - Write all logs error (and below) to `error.log`.
//     //
//     //new winston.transports.File({ filename: "error.log", level: "error" }),
//     //new winston.transports.File({ filename: "combined.log" }),
//     new winston.transports.Console({
//       format: winston.format.simple()
//     })
//   ]
// });

// // Bind each shortcut method to this logger
// const info = logger.log.bind(logger, 'info');
// const error = logger.log.bind(logger, 'error');
// const warn = logger.log.bind(logger, 'warn');

module.exports = {
    winstonLogger: log,
    info,
    warn,
    error
};
