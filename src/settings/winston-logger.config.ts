import winston from 'winston';

import systemConfig from '@core/config/system';

const { addColors, format } = winston;
const { combine, timestamp, colorize, printf, errors } = format;

addColors({
  info: 'bold green',
  debug: 'bold magenta',
  error: 'bold red',
  http: 'bold cyan',
});

export const consoleLogFormat = combine(
  winston.format((info) => {
    info.level = info.level.toUpperCase();
    return info;
  })(),
  errors({ stack: true }),
  timestamp(),
  colorize({
    all: true,
  }),
  printf(
    (info) =>
      `${info.timestamp} - [${info.level}] - ${info.message} ${
      info.stack ? `- ${info.stack}` : ''
    }`,
  ),
);

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(consoleLogFormat),
  }),
];

// if (systemConfig.ELASTICSEARCH_LOG_ENDPOINT) {
//   const esTransport = new ElasticsearchTransport({
//     level: 'http',
//     clientOpts: {
//       node: systemConfig.ELASTICSEARCH_LOG_ENDPOINT || '',
//       auth: {
//         username: '',
//         password: '',
//       },
//     },
//   });

//   esTransport.on('error', (error) => {
//     LoggerService.error(`Error in logger caught: ${error?.message}`);
//   });

//   transports.push(esTransport);
// }

export const loggerOptions: winston.LoggerOptions = {
  level: systemConfig.isProduction ? 'info' : 'debug',
  transports,
};
