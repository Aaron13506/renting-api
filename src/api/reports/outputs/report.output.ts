import { ObjectType } from '@nestjs/graphql';
import { PaginationOutput } from '../../../common/generics/pagination.output';
import { Report } from '../../../database/entities/report.entity';

@ObjectType()
export class ReportOutput extends PaginationOutput(Report) {}
