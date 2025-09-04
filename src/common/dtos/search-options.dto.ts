import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SearchOptionsDto {
  @Field(() => String, { defaultValue: '' })
  readonly value?: string = '';
}
