import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';
import { DatabaseConfigI } from './interface/database-config.interface';
import JoiUtil, { JoiConfig } from './util/joi';
import { config as dotenvConfig } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

dotenvConfig({ path: 'env/develop.env' });

const configs: JoiConfig<DatabaseConfigI> = {
  type: {
    joi: Joi.string().required(),
    value: 'mysql',
  },
  entities: {
    joi: Joi.array().items(Joi.string()).required(),
    value: [__dirname + '/../database/entities/*.entity{.ts,.js}'],
  },
  migrations: {
    joi: Joi.array().items(Joi.string()).required(),
    value: [__dirname + '/../database/migrations/*{.ts,.js}'],
  },
  synchronize: {
    joi: Joi.boolean().required(),
    value: false,
  },
  autoLoadEntities: {
    joi: Joi.boolean().required(),
    value: true,
  },
  host: {
    joi: Joi.string().required(),
    value: process.env.TYPEORM_HOST,
  },
  database: {
    joi: Joi.string().required(),
    value: process.env.TYPEORM_DATABASE,
  },
  port: {
    joi: Joi.number().required(),
    value: parseInt(process.env.TYPEORM_PORT),
  },
  username: {
    joi: Joi.string().required(),
    value: process.env.TYPEORM_USERNAME,
  },
  password: {
    joi: Joi.string().required(),
    value: process.env.TYPEORM_PASSWORD,
  },
};

export const DatabaseConfig = registerAs('database', (): DatabaseConfigI => {
  return JoiUtil.validate(configs);
});

const validatedConfig = JoiUtil.validate(configs);
export const connectionSource = new DataSource(
  validatedConfig as DataSourceOptions,
);
