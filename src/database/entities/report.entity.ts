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
import { ReportPriorityEnum } from '../../common/enums/report-priority.enum';
import { ReportStatusEnum } from '../../common/enums/report-status.enum';
import { Lease } from './lease.entity';
import { User } from './user.entity';
import { Notification } from './notification.entity';

@ObjectType()
@Entity({ name: 'report' })
export class Report {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'Unique Reports ID' })
  id: string;

  @Column({
    type: 'varchar',
    length: 500,
  })
  @Field()
  description: string;

  @Column({
    type: 'varchar',
    length: 500,
    default: null,
  })
  @Field({ nullable: true })
  cancelled_reason?: string;

  @Column({
    type: 'timestamp',
    default: null,
  })
  @Field({ nullable: true })
  estimated_date?: Date;

  @Column({
    type: 'enum',
    enum: ReportStatusEnum,
    default: ReportStatusEnum.PENDING,
  })
  @Field()
  status: ReportStatusEnum;

  @Column({
    type: 'enum',
    enum: ReportPriorityEnum,
  })
  @Field()
  priority: ReportPriorityEnum;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => User, (item) => item.reports, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  @Field(() => User, { nullable: true })
  reporter: User;

  @ManyToOne(() => Lease, (item) => item.reports, {})
  @JoinColumn()
  @Field(() => Lease, { nullable: true })
  lease: Lease;

  @OneToMany(() => Notification, (item) => item.report)
  @Field(() => [Notification], { nullable: true })
  notifications: Notification[];
}
