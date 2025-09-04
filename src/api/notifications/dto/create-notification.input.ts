import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateNotificationInput {
  @Field(() => String, { description: 'Notification message', nullable: true })
  message: string;

  @Field(() => String, { description: 'idUser', nullable: true })
  idUser: string;

  @Field(() => String, { description: 'idReport', nullable: true })
  idReport: string;

  @Field(() => String, { description: ' idBilling', nullable: true })
  idBilling: string;

  @Field(() => String, { description: 'idLease ', nullable: true })
  idLease: string;

  @Field(() => String, { description: 'Notification type', nullable: true })
  notificationType: string;
}
