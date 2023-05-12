import fs from 'fs';

import { dataSourceOptions } from 'src/settings/typeorm';

const writeTypeOrmConfig = async () =>
  fs.writeFileSync(
  'ormconfig.json',
  JSON.stringify(dataSourceOptions, null, 2), // last parameter can be changed based on how you want the file indented
);

writeTypeOrmConfig();
