import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class OwnerInput {
  @Field(() => String, { description: 'First Name' })
  firstName: string;

  @Field(() => String, { description: 'Last Name' })
  lastName: string;

  @Field(() => String, { description: 'phone' })
  phone: string;

  @Field(() => String, { description: 'Profile Picture', nullable: true })
  image?: string;

  @Field(() => String, { description: 'Email', nullable: true })
  email?: string;
  @Field(() => [String], { description: 'Properties', nullable: true })
  properties?: string[];

  @Field(() => String, { description: 'navBgColor', nullable: true })
  navBgColor?: string;

  @Field(() => String, { description: 'textColor', nullable: true })
  textColor?: string;

  @Field(() => String, { description: 'secondTextColor', nullable: true })
  secondTextColor?: string;

  @Field(() => String, { description: 'borderColor', nullable: true })
  borderColor?: string;

  @Field(() => String, { description: 'buttonsColor', nullable: true })
  buttonsColor?: string;

  @Field(() => String, { description: 'iconsColor', nullable: true })
  iconsColor?: string;

  @Field(() => String, { description: 'navBgColor', nullable: true })
  hoverColor?: string;

  @Field(() => String, { description: 'fontWeight', nullable: true })
  fontWeight?: string;

  @Field(() => String, { description: 'font', nullable: true })
  fontFamily?: string;
}
