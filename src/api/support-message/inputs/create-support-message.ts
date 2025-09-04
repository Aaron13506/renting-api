import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';

@InputType()
export class CreateSupportMessageInput {
  @IsOptional()
  @Field(() => String, { description: 'message', nullable: true })
  message?: string;

  @IsOptional()
  @Field(() => String, { description: 'url', nullable: true })
  url?: string;

  @IsOptional()
  @Field(() => String, { description: 'chatId', nullable: true })
  chatId?: string;
}
