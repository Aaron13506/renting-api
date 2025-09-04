import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
  @Field(() => String, { description: 'First Name' })
  firstName: string;

  @Field(() => String, { description: 'Last Name' })
  lastName: string;

  @Field(() => String, { description: 'phone' })
  phone: string;

  @Field(() => String, { description: 'Profile Picture', nullable: true })
  image?: string;

  @Field(() => String, { description: 'Email', nullable: true })
  email?: string;
}
