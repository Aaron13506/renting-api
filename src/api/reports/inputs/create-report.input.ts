import { InputType, Field} from '@nestjs/graphql';
import { ReportPriorityEnum } from '../../../common/enums/report-priority.enum';

@InputType()
export class CreateReportInput {
  @Field(() => String, { description: 'Description' })
  description: string;

  @Field(() => ReportPriorityEnum, { description: 'Priority' })
  priority: ReportPriorityEnum;

  @Field(() => String, { description: 'LeaseId' })
  leaseID: string;
}
