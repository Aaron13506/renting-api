import { registerEnumType } from '@nestjs/graphql';

export enum BillingStatusEnum {
  'DELETED' = 'deleted',
  'OVERDUE' = 'overdue',
  'PENDING' = 'pending',
  'PAID' = 'paid',
}

registerEnumType(BillingStatusEnum, {
  name: 'BillingStatusEnum',
});
