import fs from "fs";
import path from "path";
import winston from "winston";

import { ENVIRONMENT } from "./secrets";
const logDir = "log";
if ( !fs.existsSync( logDir ) ) {
    fs.mkdirSync( logDir );
}

const logger = winston.createLogger({
    transports: [
        new (winston.transports.Console)({ level: process.env.NODE_ENV === "production" ? "error" : "debug" }),
        new (winston.transports.File)({ filename: path.join(logDir, "/debug.log"), level: "debug"})
    ]
});

if (process.env.NODE_ENV !== "production") {
    logger.debug("Logging initialized at debug level");
}

export default logger;
