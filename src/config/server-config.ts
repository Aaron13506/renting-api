import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import { ServerConfigI } from './interface/server-config.interface';
import JoiUtil, { JoiConfig } from './util/joi';

export const ServerConfig = registerAs('server', (): ServerConfigI => {
  const configs: JoiConfig<ServerConfigI> = {
    nodeEnv: {
      value: process.env.NODE_ENV,
      joi: Joi.string().required().valid('develop', 'production'),
    },
    port: {
      value: process.env.SERVER_PORT,
      joi: Joi.number().required(),
    },
    frontUrl: {
      value: process.env.FRONT_URL,
      joi: Joi.string().required(),
    },
    appName: {
      value: process.env.APP_NAME,
      joi: Joi.string().required(),
    },
  };

  return JoiUtil.validate(configs);
});
