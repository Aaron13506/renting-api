import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BillingStatusEnum } from 'src/common/enums/billing-status.enum';
import { Lease } from './lease.entity';
import { Notification } from './notification.entity';

@ObjectType()
@Entity({ name: 'billing' })
export class Billing {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'Unique billing ID' })
  id: string;

  @Column({
    type: 'timestamp',
    default: null,
  })
  @Field()
  date: Date;

  @Column({
    name: 'amount',
    type: 'float',
    default: 0,
  })
  @Field()
  amount: number;

  @Column({
    type: 'enum',
    enum: BillingStatusEnum,
    default: BillingStatusEnum.PENDING,
  })
  @Field()
  status: BillingStatusEnum;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  paymentReceipt: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => Lease, (item) => item.billings, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  @Field(() => Lease, { nullable: true })
  lease?: Lease;

  @OneToMany(() => Notification, (item) => item.bill)
  @Field(() => [Notification], { nullable: true })
  notifications: Notification[];
}
