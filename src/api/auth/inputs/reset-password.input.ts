import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";

@InputType()
export class resetPasswordInput{
  @IsString()
  @IsNotEmpty()
  @Field({
    description: "user's old password",
  })
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @Field({
    description: "New Password",
  })
  password: string;
}
