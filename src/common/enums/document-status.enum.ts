import { registerEnumType } from '@nestjs/graphql';

export enum DocumentStatusEnum {
  'ORIGINAL' = 'Original Upload',
  'SIGNED' = 'Signed by Tenant',
  'REJECTED' = 'Rejected',
}
registerEnumType(DocumentStatusEnum, {
  name: 'DocumentStatusEnum',
});
