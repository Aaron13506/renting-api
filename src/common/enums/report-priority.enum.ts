import { registerEnumType } from '@nestjs/graphql';

export enum ReportPriorityEnum {
  'URGENT' = 'urgent',
  'REGULAR' = 'regular',
}
registerEnumType(ReportPriorityEnum, {
  name: 'ReportPriorityEnum',
});
