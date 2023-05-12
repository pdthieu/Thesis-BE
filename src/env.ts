import fs from 'fs';
import path from 'path';

import { config as dotEnvConfig } from 'dotenv';
import { Logger } from '@nestjs/common';

const env = process.env.NODE_ENV || 'development';
const envPath = path.resolve(__dirname, '../.env');
const isTest = env === 'test';

process.env.NODE_ENV = env;

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [
  `${envPath}.${env}.local`,
  !isTest && `${envPath}.local`,
  `${envPath}.${env}`,
  envPath,
].filter(Boolean) as string[];

let envVars = {
  NODE_ENV: env,
};

dotenvFiles.forEach((dotenvFile) => {
  if (fs.existsSync(dotenvFile)) {
    envVars = Object.assign(
      dotEnvConfig({
        path: dotenvFile,
      }).parsed,
      envVars,
    );
  }
});

if (env !== 'production') {
  Logger.log(JSON.stringify(envVars, null, 2));
}
