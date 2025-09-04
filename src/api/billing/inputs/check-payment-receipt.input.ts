import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class checkPaymentReceiptInput {
  @Field({ description: 'Id billing to pay' })
  idBill: string;

  @Field({ description: 'Check payment receipt' })
  value: string;
}
