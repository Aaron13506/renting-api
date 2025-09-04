import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import JoiUtil, { JoiConfig } from './util/joi';
import { TwilioConfigI } from './interface/twilio-config.interface';

export const TwilioConfig = registerAs('twilio', (): TwilioConfigI => {
  const configs: JoiConfig<TwilioConfigI> = {
    accountSid: {
      value: process.env.TWILIO_ACCOUNT_SID,
      joi: Joi.string().required(),
    },
    authToken: {
      value: process.env.TWILIO_AUTH_TOKEN,
      joi: Joi.string().required(),
    },
    defaultNumber: {
      value: process.env.TWILIO_NUMBER,
      joi: Joi.string().required(),
    },
  };

  return JoiUtil.validate(configs);
});
