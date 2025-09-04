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
import { Billing } from './billing.entity';
import { Lease } from './lease.entity';
import { Report } from './report.entity';

@ObjectType()
@Entity({ name: 'notification' })
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'Unique Notification Id' })
  id: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  notificationType: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  message: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  status: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => User, (item) => item.notifications)
  @JoinColumn()
  @Field(() => User, { nullable: true })
  user: User;

  @ManyToOne(() => Report, (item) => item.notifications)
  @JoinColumn()
  @Field(() => Report, { nullable: true })
  report: Report;

  @ManyToOne(() => Billing, (item) => item.notifications)
  @JoinColumn()
  @Field(() => Billing, { nullable: true })
  bill: Billing;

  @ManyToOne(() => Lease, (item) => item.notifications)
  @JoinColumn()
  @Field(() => Lease, { nullable: true })
  lease: Lease;
}
