import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  BeforeInsert,
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
import { BillingSettings } from './billing-settings.entity';
import { Lease } from './lease.entity';
import { User } from './user.entity';
import { CommunityMessage } from './community-message.entity';

@ObjectType()
@Entity({ name: 'property' })
export class Property {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'Unique Property ID' })
  id: string;

  @Column({
    type: 'varchar',
    length: 250,
  })
  @Field({nullable: true})
  owner_space: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field()
  name: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field()
  address: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field()
  longitud: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field()
  latitud: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  images?: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @ManyToOne(() => User, (item) => item.properties, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn()
  @Field(() => User, { nullable: true })
  owner: User;

  @OneToOne(() => BillingSettings, (item) => item.property)
  @Field(() => [BillingSettings], { nullable: true })
  billingSettings: BillingSettings;

  @OneToMany(() => Lease, (item) => item.property)
  @Field(() => [Lease], { nullable: true })
  leases: Lease[];

  @OneToMany(() => CommunityMessage, (item) => item.property)
  @Field(() => [CommunityMessage], { nullable: true })
  messages: CommunityMessage[];

  @BeforeInsert()
  public async setDefaultBillingSettings() {
    if (!this.billingSettings) {
      this.billingSettings = new BillingSettings();
    }
  }
}
