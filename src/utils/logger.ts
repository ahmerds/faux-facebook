import winston, { debug } from "winston";
import config from "../config"


let logger: winston.Logger
const label = config.SERVICE_NAME

if (config.NODE_ENV === "development") {
    logger = winston.createLogger({
        level: "debug",
        format: winston.format.combine(
            winston.format.label({ label }),
            winston.format.timestamp(),
            winston.format.json()
        ),
        transports: [
            //
            // - Write to all logs with level `info` and below to `combined.log` 
            // - Write all logs error (and below) to `error.log`.
            //
            new (winston.transports.Console)({ level: "debug" }),
            new (winston.transports.File)({ filename: 'error.log', level: 'error' }),
            new (winston.transports.File)({ filename: "combined.log"})
        ],
        exceptionHandlers: [
            new (winston.transports.Console)({ level: 'error' }),
            new (winston.transports.File)({ filename: 'exceptions.log' })
        ]
    });

    logger.debug("Initialized debug level logger");
} else if (config.NODE_ENV === "production" ) {
    logger = winston.createLogger({
        level: "debug",
        format: winston.format.combine(
            winston.format.label({ label }),
            winston.format.timestamp(),
            winston.format.json()
        ),
        transports: [
            new (winston.transports.Console)({ level: "debug" })
        ],
        exceptionHandlers: [
            new (winston.transports.File)({ filename: 'exceptions.log' })
        ]
    })
    
    
    // logger.exitOnError = false
    logger.debug("Initialized debug level logger on production");
} else {
    logger = winston.createLogger({
        level: "info",
        format: winston.format.simple(),
        transports: [
            new winston.transports.Console()
        ]
    })
}


export default logger;