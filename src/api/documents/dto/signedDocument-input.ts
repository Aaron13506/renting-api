import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class SigneDocumentInput {
  @IsString()
  @Field(() => String, { description: 'Document id' })
  documentId: string;

  @IsString()
  @Field(() => String, { description: 'Document', nullable: true })
  documentUrl: string;
}
