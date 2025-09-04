import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';


@InputType()
export class UploadInput {
  @IsString()
  @Field(() => String, { description: 'Destination Folder' })
  location: string;

  @IsString()
  @Field(() => String, { description: 'Image Type' })
  type: string;

  @IsString()
  @Field(() => String, { description: 'base64' })
  base: string;

  @IsString()
  @Field(() => String, { description: 'Image Filename' })
  name: string;


}
