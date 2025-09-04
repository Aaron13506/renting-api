import { registerEnumType } from '@nestjs/graphql';

export enum LeaseStatusEnum {
  'ACTIVE' = 'active',
  'INACTIVE' = 'inactive',
  'NOT_VALIDATED' = 'not validated',
  'DELETED' = 'deleted',
}

registerEnumType(LeaseStatusEnum, {
  name: 'LeaseStatusEnum',
});
