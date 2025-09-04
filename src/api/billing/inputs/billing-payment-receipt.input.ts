import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class paymentReceiptInput {
  @Field({ description: 'Id billing to pay' })
  idBill: string;

  @Field({ description: 'Payment receipt' })
  paymentReceipt: string;
}
