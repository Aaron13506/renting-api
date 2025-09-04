import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'email-code' })
export class EmailCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 250,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    length: 250,
  })
  code: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  private async lowerCaseEmail() {
    this.email = this.email?.toLocaleLowerCase();
  }
}
