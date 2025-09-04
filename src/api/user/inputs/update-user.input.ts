import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
  @Field(() => String, { description: 'First Name', nullable: true })
  firstName?: string;

  @Field(() => String, { description: 'Last Name', nullable: true  })
  lastName?: string;

  @Field(() => String, { description: 'phone', nullable: true })
  phone?: string;

  @Field(() => String, { description: 'Profile Picture', nullable: true})
  image?: string;


  @Field(() => String, { description: 'email', nullable: true})
  email?: string;
}
