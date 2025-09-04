import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Document } from './document.entity';
import { User } from './user.entity';

@ObjectType()
@Entity({ name: 'document-version' })
export class DocumentVersion {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'Unique Document ID' })
  id: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  name: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  status: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  contentUrl: string;

  @ManyToOne(() => User, (item) => item.versionDocument)
  @JoinColumn()
  @Field(() => User, { nullable: true })
  signedBy: User;

  @Column({
    type: 'timestamp',
    default: null,
  })
  @Field()
  uploadedAt: Date;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @OneToOne(() => Document, (document) => document.version,)
  @JoinColumn()
  @Field(() => Document, { nullable: true })
  documentId: Document;
}

