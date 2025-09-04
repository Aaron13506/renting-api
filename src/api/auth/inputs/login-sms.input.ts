import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { OwnerSpaceInput } from '../../../common/inputs/owner-space.input';

@InputType()
export class LoginSmsInput  extends OwnerSpaceInput {
  @IsString()
  @IsNotEmpty()
  @Field({
    description: "user's phone number",
  })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @Field({
    description: "user's temporal code",
  })
  code: string;
}
