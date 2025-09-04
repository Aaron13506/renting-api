import { Field, ID, ObjectType } from '@nestjs/graphql';
import { StatusEnum } from '../../common/enums/status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@ObjectType()
@Entity({ name: 'term-condition' })
export class TermCondition {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'Unique Terms ID' })
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: null,
  })
  @Field()
  name: string;

  @Column({
    type: 'longblob',
  })
  @Field()
  document: string;

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.ACTIVE,
  })
  @Field()
  status: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;
}
