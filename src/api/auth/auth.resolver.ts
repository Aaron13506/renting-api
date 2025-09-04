import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthRequest } from 'src/common/decorators/auth-request';

import { UserD } from 'src/common/decorators/user.decorator';
import { User } from 'src/database/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginPassInput } from './inputs/login-pass.input';
import { LoginSmsInput } from './inputs/login-sms.input';
import { LoginOutput } from './outputs/login.output';
import { SendSmsCodeInput } from './inputs/send-sms-code.input';
import { BasicRequest } from 'src/common/decorators/basic-request';
import { ChangeNumberInput } from './inputs/change-number.input';
import { ChangeNumberByAdminInput } from './inputs/change-number-by-admin.input';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { resetPasswordInput } from './inputs/reset-password.input';

@Resolver('Auth')
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @AuthRequest()
  @Query(() => User, { name: 'getProfile' })
  getProfile(@UserD() user: User) {
    return this.authService.getUserInfo(user);
  }

  @BasicRequest()
  @Query(() => LoginOutput, { name: 'loginPass' })
  async loginPass(@Args('LoginPassInput') input: LoginPassInput) {
    return this.authService.loginPass(input);
  }

  @BasicRequest()
  @Query(() => String, { name: 'userEmail' })
  async emailRequest(@Args('Email') email: string) {
    return this.authService.emailRequest(email);
  }

  @BasicRequest()
  @Query(() => LoginOutput, { name: 'loginSms' })
  async loginSms(@Args('LoginSmsInput') input: LoginSmsInput) {
    return this.authService.loginSms(input);
  }

  @BasicRequest()
  @Mutation(() => String, { name: 'sendSmsCode' })
  async sendSmsCode(@Args('SendSmsCodeInput') input: SendSmsCodeInput) {
    return this.authService.sendSmsCode(input);
  }

  @BasicRequest()
  @Mutation(() => String, { name: 'sendCodeForChangeNumber' })
  async sendNumberVerificationCode(
    @Args('changeNumberCode') input: SendSmsCodeInput,
  ) {
    return this.authService.sendChangeNumberVerificationCode(input);
  }

  @AuthRequest()
  @Mutation(() => User, { name: 'changeUserNumber' })
  async changeNumber(
    @Args('changeUserNumber') input: ChangeNumberInput,
    @UserD() user: User,
  ) {
    return this.authService.changeNumberByUser(user, input);
  }

  @AuthRequest({
    roles: [UserRoleEnum.ADMIN],
  })
  @Mutation(() => User, { name: 'changeUserNumberByAdmin' })
  async changeNumberByAdmin(
    @Args('changeUserNumber') input: ChangeNumberByAdminInput,
    @UserD() user: User,
  ) {
    return this.authService.changeNumberByAdmin(user, input);
  }

  @AuthRequest()
  @Mutation(() => String, { name: 'resetPassword' })
  resetPassword(
    @Args('resetPassword') input: resetPasswordInput,
    @UserD() user: User,
  ) {
    return this.authService.resetPassword(user, input);
  }
}
