import { registerEnumType } from '@nestjs/graphql';

export enum UserRoleEnum {
  'ACCOUNT' = 'account',
  'OWNER' = 'owner',
  'ADMIN' = 'admin',
}
registerEnumType(UserRoleEnum, {
  name: 'UserRoleEnum',
});
