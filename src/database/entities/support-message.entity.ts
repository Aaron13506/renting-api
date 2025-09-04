import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { SupportChat } from './support-chat.entity';

@ObjectType()
@Entity({ name: 'support-message' })
export class SupportMessage {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'Unique SupportMessage ID' })
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: null,
  })
  @Field({ nullable: true })
  message: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: null,
  })
  @Field({ nullable: true })
  url: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => User, (item) => item.supportMessage, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  @Field(() => User, { nullable: true })
  user: User;

  @ManyToOne(() => SupportChat, (item) => item.messages, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  @Field(() => SupportChat, { nullable: true })
  chat: SupportChat;
}
