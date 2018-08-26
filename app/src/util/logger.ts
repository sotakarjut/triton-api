import fs from "fs";
import path from "path";
import { createLogger, format, transports} from "winston";

import { ENVIRONMENT } from "./secrets";

const { combine, timestamp, label, printf } = format;

const myFormat = printf((info) => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

const logDir = "log";
if ( !fs.existsSync( logDir ) ) {
    fs.mkdirSync( logDir );
}

const logger = createLogger({
    format: combine(
    format.timestamp({
            format: "YYYY-MM-DD HH:mm:ss"
        }),
    myFormat
    ),
    transports: [
        new (transports.Console)({ level: process.env.NODE_ENV === "production" ? "error" : "debug" }),
        new (transports.File)({ filename: path.join(logDir, "/debug.log"), level: "debug"}),
        new (transports.File)({ filename: path.join(logDir, "/error.log"), level: "debug"})
    ]
});

if (process.env.NODE_ENV !== "production") {
    logger.debug("Logging initialized at debug level");
}

export default logger;
