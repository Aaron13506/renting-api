import { ObjectType } from '@nestjs/graphql';
import { PaginationOutput } from '../../../common/generics/pagination.output';
import { Lease } from '../../../database/entities/lease.entity';

@ObjectType()
export class LeaseOutput extends PaginationOutput(Lease) {}
