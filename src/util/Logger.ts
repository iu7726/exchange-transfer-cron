import util from "util";
import Winston, { format, Logger } from "winston";
import DotEnv from "dotenv";

DotEnv.config();

const { combine, timestamp, colorize, printf, label } = Winston.format;

const clc = {
  bold: (text: string) => `\x1B[1m${text}\x1B[0m`,
  green: (text: string) => `\x1B[32m${text}\x1B[39m`,
  yellow: (text: string) => `\x1B[33m${text}\x1B[39m`,
  red: (text: string) => `\x1B[31m${text}\x1B[39m`,
  magentaBright: (text: string) => `\x1B[95m${text}\x1B[39m`,
  cyanBright: (text: string) => `\x1B[96m${text}\x1B[39m`,
};

const logFormat = (appName?: string) => {
  return printf(({ message, timestamp }) => {
    if (typeof message == "string") {
      message = message.replace(/\r\n/gi, "");
      message = message.replace(/\\n/gi, "");
      message = message.replace(/\n/gi, "");
    }

    if (appName) {
      return `[${clc.green(appName)}] ${timestamp} ${message}`;
    } else {
      return `${timestamp} ${message}`;
    }
  });
};

export const serializeArgs = (args: any[]): string => {
  const hasObject = args.filter((arg) => arg instanceof Object).length > 0;
  const msg = args.reduce((msg, cur, index) => {
    if (cur instanceof Object) {
      if (index == 0) {
        msg = `${util.formatWithOptions(
          { colors: true, compact: true },
          "%o",
          cur
        )}`;
      } else {
        msg = `${msg} ${util.formatWithOptions(
          { colors: true, compact: true },
          "%o",
          cur
        )}`;
      }
    } else if (typeof cur == "number") {
      if (index == 0) {
        msg = `${clc.yellow(String(cur))}`;
      } else {
        msg = `${msg} ${clc.yellow(String(cur))}`;
      }
    } else if (cur == undefined) {
      if (index == 0) {
        msg = `${clc.cyanBright("undefined")}`;
      } else {
        msg = `${msg} ${clc.cyanBright("undefined")}`;
      }
    } else if (typeof cur == "string") {
      if (index == 0) {
        msg = `${cur}`;
      } else {
        msg = `${msg} ${cur}`;
      }
    } else {
      if (index == 0) {
        msg = `${cur}`;
      } else {
        msg = `${msg} ${cur}`;
      }
    }
    return msg;
  }, "");

  if (hasObject) {
    return `\n${msg}`;
  } else {
    return msg;
  }
};

let windstonLogger: Logger;

export const initLogger = (appName?: string) => {
  windstonLogger = Winston.createLogger({
    format: combine(
      colorize({}),
      label({}),
      Winston.format.json({}),
      timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
      }),
      logFormat(appName)
    ),
    transports: [new Winston.transports.Console()],
  });
};

export const logger = {
  load: (...args: any[]) => {
    windstonLogger?.info(
      serializeArgs([`[${clc.yellow("InstanceLoader")}] -`, ...args])
    );
  },
  log: (...args: any[]) => {
    windstonLogger?.info(serializeArgs([`[${clc.yellow("Log")}] -`, ...args]));
  },
  info: (...args: any[]) => {
    windstonLogger?.info(serializeArgs([`[${clc.green("Info")}] -`, ...args]));
  },
  debug: (...args: any[]) => {
    windstonLogger?.info(
      serializeArgs([`[${clc.cyanBright("Debug")}] -`, ...args])
    );
  },
  alert: (...args: any[]) => {
    windstonLogger?.info(
      serializeArgs([`[${clc.magentaBright("Alert")}] -`, ...args])
    );
  },
  error: (...args: any[]) => {
    windstonLogger?.info(serializeArgs([`[${clc.red("Error")}] -`, ...args]));
  },
};