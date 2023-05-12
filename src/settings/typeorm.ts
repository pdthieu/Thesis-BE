import { join } from 'path';

import dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

import systemConfig from '@core/config/system';

dotenv.config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: systemConfig.getPostgresUrl(),
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrationsTableName: 'migrations',
  migrations: [join(__dirname, '..', 'migrations', '*{.ts,.js}')],
  synchronize: systemConfig.postgresSynchronize === 'true',
  logging: !!systemConfig.isDebugging,
  // // redis doesn't support current version typeorm
  // cache: {
  //   type: 'redis',
  //   options: {
  //     url: systemConfig.getRedisUrl(),
  //   },
  // },
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
