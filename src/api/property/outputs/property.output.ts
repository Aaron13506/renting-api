import { Property } from '../../../database/entities/property.entity';
import { PaginationOutput } from '../../../common/generics/pagination.output';
import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PropertyOutput extends PaginationOutput(Property) {}
