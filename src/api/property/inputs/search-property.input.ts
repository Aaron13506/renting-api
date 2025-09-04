import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SearchPropertyInput {
  @Field(() => String, { defaultValue: '' })
  value?: string = '';
}
