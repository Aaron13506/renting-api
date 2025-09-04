import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

ObjectType();
@Entity({ name: 'file' })
export class File {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'Unique File ID' })
  id: string;

  @Column({
    type: 'varchar',
    length: 255,
    default: null
  }
  )
  @Field()
  filename:string

  @Column({
    type: 'varchar',
    length: 255,
    default: null
  }
  )
  @Field()
  type:string

  @Column({
    type: 'varchar',
    length: 255,
    default: null
  }
  )
  @Field()
  bucket:string

  @Column({
    type: 'varchar',
    length: 255,
    default: null
  }
  )
  @Field()
  url:string

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

}
