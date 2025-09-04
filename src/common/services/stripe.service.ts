import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { default as Stripe } from 'stripe';

// type CreateSessionResponse = { url: string };
//
// type L = HttpException;

@Injectable()
export default class StripeService {
  public stripe: Stripe;
  public _stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get('stripe.public_key'));
    this._stripe = new Stripe(this.configService.get('stripe.private_key'));
  }
  //
  // public async createCustomer(name: string, email: string) {
  //   try {
  //     const customer = await this._stripe.customers.create({
  //       name,
  //       email,
  //     });
  //     if (!customer) {
  //       return Either.makeLeft<L, Stripe.Customer>(
  //         new HttpException('Payment intent error', HttpStatus.BAD_REQUEST),
  //       );
  //     }
  //     return Either.makeRight<L, Stripe.Customer>(customer);
  //   } catch (error) {
  //     return Either.makeLeft<L, Stripe.Customer>(
  //       new HttpException(error, HttpStatus.BAD_REQUEST),
  //     );
  //   }
  // }
  //
  // public async createSession({ mode = 'payment', ...body }: CreateSessionDto) {
  //   try {
  //     const session = await this._stripe.checkout.sessions.create({
  //       mode,
  //       line_items: [
  //         {
  //           price: body.priceId,
  //           quantity: 1,
  //         },
  //       ],
  //       customer: body.customerId,
  //       success_url:
  //         process.env.DASHBOARD_URL +
  //         (mode === 'subscription'
  //           ? '/subscription-validate'
  //           : '/credits-validate'),
  //       cancel_url: process.env.DASHBOARD_URL,
  //     });
  //     if (!session || !session.url)
  //       return Either.makeLeft<L, CreateSessionResponse>(
  //         new HttpException('Payment intent error', HttpStatus.BAD_REQUEST),
  //       );
  //     return Either.makeRight<L, CreateSessionResponse>({ url: session.url });
  //   } catch (error) {
  //     return Either.makeLeft<L, CreateSessionResponse>(
  //       new HttpException(error, HttpStatus.BAD_REQUEST),
  //     );
  //   }
  // }
  //
  // public async createPrice(body: CreatePriceDto) {
  //   const type = body.recurring ? 'recurring' : 'one_time';
  //   const stripePricelist = await this._stripe.prices.list({ type });
  //   const priceIndex = stripePricelist.data.findIndex(
  //     (price) => price.unit_amount === body.amount,
  //   );
  //   if (priceIndex >= 0) {
  //     return Either.makeRight<L, Stripe.Price>(
  //       stripePricelist.data[priceIndex],
  //     );
  //   }
  //   try {
  //     const newPrice = await this._stripe.prices.create({
  //       currency: body.currency,
  //       unit_amount: body.amount,
  //       product_data: {
  //         name: body.name,
  //       },
  //       recurring: body.recurring,
  //     });
  //     return Either.makeRight<L, Stripe.Price>(newPrice);
  //   } catch (error) {
  //     return Either.makeLeft<L, Stripe.Price>(
  //       new HttpException('Something goes Wrong', HttpStatus.BAD_REQUEST),
  //     );
  //   }
  // }
  //
  // public async cancelSubscription(id: string) {
  //   try {
  //     const subscription = await this._stripe.subscriptions.cancel(id);
  //     return Either.makeRight<L, Stripe.Subscription>(subscription);
  //   } catch (error) {
  //     return Either.makeLeft<L, Stripe.Subscription>(
  //       new HttpException(error, HttpStatus.BAD_REQUEST),
  //     );
  //   }
  // }
}
