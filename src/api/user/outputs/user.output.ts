import { ObjectType } from '@nestjs/graphql';
import { User } from '../../../database/entities/user.entity';
import { PaginationOutput } from '../../../common/generics/pagination.output';

@ObjectType()
export class UserOutput extends PaginationOutput(User) {}
