import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class OwnerSpaceInput {
  @Field({
    description: "property's public id",
    nullable: true,
  })
  owner_space?: string;
}
