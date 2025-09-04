import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class UpdateDocumentInput {
  @IsString()
  @Field(() => String, { description: 'Document id' })
  documentId: string;

  @IsString()
  @Field(() => String, { description: 'Document Name', nullable: true })
  documentName: string;

  @IsString()
  @Field(() => String, { description: 'Document', nullable: true })
  documentUrl: string;
}
