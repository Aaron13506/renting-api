import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import { JWTConfigI } from './interface/jwt-config.interface';
import JoiUtil, { JoiConfig } from './util/joi';

export const JWTConfig = registerAs('jwt', (): JWTConfigI => {
  const configs: JoiConfig<JWTConfigI> = {
    secret: {
      value: process.env.JWT_SECRET,
      joi: Joi.string().required(),
    },
    expiresIn: {
      value: process.env.JWT_EXPIRES_IN,
      joi: Joi.string().required().valid('1d', '4h', '6h'),
    },
  };

  return JoiUtil.validate(configs);
});
