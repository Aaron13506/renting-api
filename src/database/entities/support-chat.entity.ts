import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { SupportMessage } from './support-message.entity';

@ObjectType()
@Entity({ name: 'support-chat' })
export class SupportChat {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'Unique SupportChat ID' })
  id: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => User, (item) => item.chats, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  @Field(() => User, { nullable: true })
  creator: User;

  @OneToMany(() => SupportMessage, (item) => item.chat, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn()
  @Field(() => [SupportMessage], { nullable: true })
  messages: SupportMessage[];
}
