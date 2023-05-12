import winston from 'winston';

import systemConfig from './system';

const { format } = winston;
const { combine, timestamp, colorize, printf } = format;

const formats = [
  winston.format((info) => {
    info.level = info.level.toUpperCase();
    return info;
  })(),
  timestamp(),
  !systemConfig.isProduction &&
    colorize({
      all: true,
      colors: {
        info: 'green',
        debug: 'magenta',
        error: 'red',
        http: 'cyan',
      },
    }),
  printf((info) => `${info.timestamp} [${info.level}] ${info.message}`),
].filter(Boolean);

export const consoleLogFormat = combine(...formats);

export const loggerOptions: winston.LoggerOptions = {
  level:
    systemConfig.isDebugging || !systemConfig.isProduction ? 'debug' : 'info',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(consoleLogFormat),
    }),
  ],
};
