import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from './property.entity';

@ObjectType()
@Entity({ name: 'billing-settings' })
export class BillingSettings {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'Unique ID' })
  id: string;

  @Column({
    name: 'offset_days',
    type: 'int',
    default: 5,
  })
  @Field()
  offsetDays: number;

  @Column({
    name: 'payment_day',
    type: 'int',
    default: 1,
  })
  paymentDay: number;

  @Column({
    name: 'grace_days',
    type: 'int',
    default: 1,
  })
  graceDays: number;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @OneToOne(() => Property, (item) => item.billingSettings)
  @JoinColumn()
  @Field(() => [Property], { nullable: true })
  property: Property;
}
