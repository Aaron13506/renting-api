import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class CreatePropertyInput {
  @IsOptional()
  @IsString()
  @Field(() => String, { description: 'Property name' })
  name!: string;

  @Field(() => String, { description: 'Property address' })
  address!: string;

  @Field(() => String, { description: 'Property longitud' })
  longitud!: string;

  @Field(() => String, { description: 'Property latitud' })
  latitud!: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Property owner', nullable: true })
  owner?: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Property Image', nullable: true })
  images?: string;
}
