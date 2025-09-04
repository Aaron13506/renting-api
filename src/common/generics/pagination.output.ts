import { Field, ObjectType } from '@nestjs/graphql';

export function PaginationOutput<T>(classRef: T) {
  @ObjectType({ isAbstract: true })
  abstract class PaginationOutput {
    @Field(() => [classRef])
    items: T[];

    @Field()
    page: number;

    @Field()
    count: number;

    @Field()
    next: boolean;
  }

  return PaginationOutput;
}
