import { registerEnumType } from '@nestjs/graphql';

export enum ReportStatusEnum {
  'PENDING' = 'pending',
  'IN_REVIEW' = 'in review',
  'ON_PROCESS' = 'on process',
  'FINISHED' = 'finished',
  'CANCEL' = 'cancel',
}
registerEnumType(ReportStatusEnum, {
  name: 'ReportStatusEnum',
});
