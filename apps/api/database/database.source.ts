import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { apiRoot, resolveDatabasePath } from '../src/database-path.js';

config({ path: `${apiRoot}/.env` });

export default new DataSource({
  type: 'better-sqlite3',
  database: resolveDatabasePath(process.env.DATABASE_PATH),
  entities: [`${apiRoot}/src/**/*.entity.{ts,js}`],
  migrations: [`${apiRoot}/database/migrations/*.{ts,js}`],
  migrationsTableName: 'migrations',
  migrationsRun: false,
  synchronize: false,
});
