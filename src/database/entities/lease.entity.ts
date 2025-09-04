import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { LeaseStatusEnum } from 'src/common/enums/lease-status.enum';
import { User } from './user.entity';
import { Property } from './property.entity';
import { Report } from './report.entity';
import { Billing } from './billing.entity';
 import { Document } from './document.entity';
import { Notification } from './notification.entity';

@ObjectType()
@Entity({ name: 'lease' })
export class Lease {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'Unique Lease ID' })
  id: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  code: string;

  @Column({
    name: 'payment_day',
    type: 'int',
    default: 0,
  })
  @Field({ nullable: true })
  paymentDay: number;

  @Column({
    name: 'amount',
    type: 'float',
    default: 0,
  })
  @Field({ nullable: true })
  amount: number;

  @Column({
    type: 'enum',
    enum: LeaseStatusEnum,
    default: LeaseStatusEnum.ACTIVE,
  })
  @Field({ nullable: true })
  status: LeaseStatusEnum;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => User, (item) => item.leases, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  @Field(() => User, { nullable: true })
  tenant: User;

  @ManyToOne(() => Property, (item) => item.leases, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  @Field(() => Property, { nullable: true })
  property: Property;

  @OneToMany(() => Billing, (item) => item.lease)
  @Field(() => [Billing], { nullable: true })
  billings: Billing[];

  @OneToMany(() => Report, (item) => item.lease)
  @Field(() => [Report], { nullable: true })
  reports: Report[];

  @OneToOne(() => Document, (document) => document.lease)
  @JoinColumn()
  @Field(()=> Document, { nullable: true })
  document: Document;

  @OneToMany(() => Notification, (item) => item.lease)
  @Field(() => [Notification], { nullable: true })
  notifications: Notification[];
}
