import 'dotenv/config';
import { Article } from 'src/entities/article.entity';
import { User } from 'src/entities/user.entity';
import { DataSource, DataSourceOptions } from 'typeorm';

export const config: DataSourceOptions = {
  type: 'postgres',
  host:  process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Article, User],
  migrations: ['dist/src/db/migrations/*{.ts,.js}'],
  synchronize: false,
  migrationsRun: true,
};


const dataSource = new DataSource(config);
export default dataSource;
