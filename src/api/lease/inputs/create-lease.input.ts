import { Field, InputType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateLeaseInput {
  @IsString()
  @Field(() => String, { description: 'Code number' })
  code: string;

  @IsNumber()
  @Field(() => Number, { description: 'Amount' })
  amount: number;

  @IsString()
  @Field(() => String, { description: 'Tenant id' })
  tenant: string;

  @IsString()
  @Field(() => String, { description: 'Property Id' })
  property: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Document Name', nullable: true })
  documentName: string;

  @IsString()
  @IsOptional()
  @Field(() => String, { description: 'Document', nullable: true })
  documentUrl: string;

  @IsNumber()
  @Field(() => Number, { description: 'Pay Day', nullable: true })
  paymentDay?: number;
}
