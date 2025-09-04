import { Field, ID, ObjectType } from '@nestjs/graphql';
import { FontStatusEnum } from 'src/common/enums/font-status.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@ObjectType()
@Entity({ name: 'font' })
export class Font {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'unique font ID' })
  id: string;

  @Column({
    name: 'name',
    type: 'varchar',
    length: 250,
  })
  @Field()
  name: string;

  @Column({
    name: 'type_name',
    type: 'varchar',
    length: 250,
  })
  @Field()
  typeName: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: FontStatusEnum,
    default: FontStatusEnum.ACTIVE,
  })
  @Field()
  status: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @OneToMany(() => User, (user) => user.fontFamily)
  @Field(()=> [User], { nullable: true })
  user: User[];
}
