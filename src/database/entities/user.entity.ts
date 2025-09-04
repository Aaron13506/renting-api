import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRoleEnum } from '../../common/enums/user-role.enum';
import { UserStatusEnum } from 'src/common/enums/user-status.enum';
import { Property } from './property.entity';
import { Lease } from './lease.entity';
import { Report } from './report.entity';
import { SupportMessage } from './support-message.entity';
import { Font } from './fonts.entity';
import { SupportChat } from './support-chat.entity';
import { CommunityMessage } from './community-message.entity';
 import { Document } from './document.entity';
import { DocumentVersion } from './document-version.entity';
import { Notification } from './notification.entity';

@ObjectType()
@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { description: 'Unique User ID' })
  id: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  firstName: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  lastName?: string;

  @Column({
    type: 'enum',
    enum: UserRoleEnum,
    default: UserRoleEnum.ACCOUNT,
  })
  @Field()
  role: UserRoleEnum;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
    select: false,
  })
  @Field({ nullable: true })
  password: string;

  @Column({
    type: 'varchar',
    length: 250,
  })
  @Field({ nullable: true })
  email?: string;

  @Column({
    type: 'varchar',
    length: 250,
  })
  @Field({ nullable: true })
  phone?: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  image?: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  navBgColor?: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  textColor?: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  secondTextColor?: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  borderColor?: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  buttonsColor?: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  iconsColor?: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  hoverColor?: string;

  @Column({
    type: 'varchar',
    length: 250,
    default: null,
  })
  @Field({ nullable: true })
  fontWeight?: string;

  @Column({
    type: 'enum',
    enum: UserStatusEnum,
    default: UserStatusEnum.ACTIVE,
  })
  @Field()
  status: UserStatusEnum;

  @Column({
    name: 'stripe_customer_id',
    length: 250,
    default: null,
  })
  stripeCustomerId: string;

  @CreateDateColumn()
  @Field()
  createdAt: Date;

  @UpdateDateColumn()
  @Field()
  updatedAt: Date;

  @OneToMany(() => Property, (item) => item.owner)
  @Field(() => [Property], { nullable: true })
  properties: Property[];

  @OneToMany(() => Lease, (item) => item.tenant)
  @Field(() => [Lease], { nullable: true })
  leases: Lease[];

  @ManyToOne(() => User, (item) => item.id)
  @JoinColumn()
  @Field(() => User, { nullable: true })
  createdBy: User;

  @OneToMany(() => User, (item) => item.createdBy)
  @Field(() => [User], { nullable: true })
  tenants: User[];

  @OneToMany(() => Report, (item) => item.reporter)
  @Field(() => [Report], { nullable: true })
  reports: Report[];

  @OneToMany(() => SupportMessage, (item) => item.user)
  @OneToMany(() => SupportMessage, (item) => item.user)
  @Field(() => [SupportMessage], { nullable: true })
  supportMessage: SupportMessage[];

  @OneToMany(() => SupportChat, (item) => item.creator)
  @Field(() => [SupportChat], { nullable: true })
  chats: SupportChat[];

  @OneToMany(() => CommunityMessage, (item) => item.userFrom)
  @Field(() => [CommunityMessage], { nullable: true })
  communityMessagesSended: CommunityMessage[];

  @OneToMany(() => CommunityMessage, (item) => item.userTo)
  @Field(() => [CommunityMessage], { nullable: true })
  communityMessagesReceived: CommunityMessage[];

   @OneToMany(() => Document, (item) => item.uploadedBy)
  @Field(() => [Document], { nullable: true })
  document: Document[];

  @OneToMany(() => DocumentVersion, (item) => item.signedBy)
  @Field(() => [DocumentVersion], { nullable: true })
  versionDocument: DocumentVersion[];

  @OneToMany(() => Notification, (item) => item.user)
  @Field(() => [Notification], { nullable: true })
  notifications: Notification[];


  @ManyToOne(() => Font, (font) => font.user)
  @JoinColumn()
  @Field({ nullable: true })
  fontFamily: Font;

  @BeforeInsert()
  @BeforeUpdate()
  private async lowerCaseEmail() {
    this.email = this.email?.toLocaleLowerCase();
  }
}
