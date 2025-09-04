import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Property } from './property.entity';

@ObjectType()
@Entity({ name: 'community-message' })
export class CommunityMessage {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'Unique Community Message ID' })
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: null,
  })
  @Field({ nullable: true })
  message: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  @Field({ nullable: true })
  individualMessage: boolean;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @ManyToOne(() => User, (item) => item.communityMessagesSended, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  @Field(() => User, { nullable: true })
  userFrom: User;

  @ManyToOne(() => User, (item) => item.communityMessagesReceived, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  @Field(() => User, { nullable: true })
  userTo: User;

  @ManyToOne(() => Property, (item) => item.messages, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  @Field(() => Property, { nullable: true })
  property: Property;
}
