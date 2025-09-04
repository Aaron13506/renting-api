import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, IsString } from "class-validator";

@InputType()
export class ChangeNumberByAdminInput {
  @IsString()
  @IsNotEmpty()
  @Field({
    description: "user's new phone number",
  })
  phone: string;


  @IsString()
  @IsNotEmpty()
  @Field({
    description: "user id",
  })
  idUser: string;

  @IsString()
  @IsNotEmpty()
  @Field({
    description: "user password",
  })
  password: string;
}
