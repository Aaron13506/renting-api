import { registerAs } from '@nestjs/config';
import { AWSConfigI } from './interface/aws-config.interface';
import JoiUtil, { JoiConfig } from './util/joi';
import * as Joi from 'joi';

export const AWSConfig = registerAs('aws', (): AWSConfigI => {
  const configs: JoiConfig<AWSConfigI> = {
    accessKey: {
      value: process.env.AWS_ACCESS_KEY_ID,
      joi: Joi.string().required(),
    },
    secretKey: {
      value: process.env.AWS_SECRET_ACCESS_KEY,
      joi: Joi.string().required(),
    },
    bucket: {
      value: process.env.AWS_BUCKET,
      joi: Joi.string().required(),
    }
  };
  return JoiUtil.validate(configs);
});
