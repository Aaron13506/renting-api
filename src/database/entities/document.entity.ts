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
import { User } from './user.entity';
import { Lease } from './lease.entity';
import { DocumentVersion } from './document-version.entity';

@ObjectType()
@Entity({ name: 'document' })
export class Document {
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

  @ManyToOne(() => User, (item) => item.document, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  @Field(() => User, { nullable: true })
  uploadedBy: User;

  @OneToOne(() => Lease, (lease) => lease.document)
  @Field(() => Lease, { nullable: true })
  lease: Lease;

  @OneToOne(() => DocumentVersion, (version) => version.documentId)
  @Field(() => DocumentVersion, { nullable: true })
  version: DocumentVersion;
}
