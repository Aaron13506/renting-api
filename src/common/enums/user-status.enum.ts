import { registerEnumType } from '@nestjs/graphql';

export enum UserStatusEnum {
  'ACTIVE' = 'active',
  'INACTIVE' = 'inactive',
  'NOT_VALIDATED' = 'not validated',
  'DELETED' = 'deleted',
}

registerEnumType(UserStatusEnum, {
  name: 'UserStatusEnum',
});
