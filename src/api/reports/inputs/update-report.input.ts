import { InputType, Field } from '@nestjs/graphql';
import { ReportPriorityEnum } from 'src/common/enums/report-priority.enum';
import { ReportStatusEnum } from 'src/common/enums/report-status.enum';

@InputType()
export class UpdateReportInput {
  @Field(() => String)
  id: string;

  @Field(() => String, { description: 'Cancel Reason', nullable: true })
  cancelReason: string;

  @Field(() => ReportPriorityEnum, { description: 'Priority', nullable: true })
  priority: ReportPriorityEnum;

  @Field(() => String, { description: 'Estimated Date', nullable: true })
  estimatedDate: Date;

  @Field(() => String, { description: 'Estimated Date', nullable: true })
  status: ReportStatusEnum;
}
