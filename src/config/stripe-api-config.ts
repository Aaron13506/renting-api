import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

import { StripeConfigI } from './interface/stripe-config.interface';
import JoiUtil, { JoiConfig } from './util/joi';

export const StripeConfig = registerAs('stripe', (): StripeConfigI => {
  const configs: JoiConfig<StripeConfigI> = {
    public_key: {
      value: process.env.STRIPE_PUBLIC_KEY,
      joi: Joi.string().required(),
    },
    private_key: {
      value: process.env.STRIPE_PRIVATE_KEY,
      joi: Joi.string().required(),
    },
    endpoint_secret: {
      value: process.env.STRIPE_ENDPOINT_SECRET_KEY,
      joi: Joi.string().required(),
    },
  };

  return JoiUtil.validate(configs);
});
