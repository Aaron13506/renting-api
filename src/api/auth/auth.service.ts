import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserStatusEnum } from 'src/common/enums/user-status.enum';
import { Either } from 'src/common/generics/either';
import { EitherError } from 'src/common/generics/error';
import TwilioService from 'src/common/services/twilio.service';
import { SmsCode } from 'src/database/entities/sms-code.entity';
import { User } from 'src/database/entities/user.entity';
import { LoginPassInput } from './inputs/login-pass.input';
import { LoginSmsInput } from './inputs/login-sms.input';
import { SendSmsCodeInput } from './inputs/send-sms-code.input';
import { JWTPayloadI } from './jwt.payload';
import { LoginOutput } from './outputs/login.output';
import { Property } from '../../database/entities/property.entity';
import { ChangeNumberInput } from './inputs/change-number.input';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { ChangeNumberByAdminInput } from './inputs/change-number-by-admin.input';
import { resetPasswordInput } from './inputs/reset-password.input';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SmsCode)
    private smsCodeRepository: Repository<SmsCode>,
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private jwtService: JwtService,
    private twilioService: TwilioService,
  ) {}

  async getUserInfo(user: User) {
    const userInfo = this.userRepository.findOne({
      where: { id: user.id },
      relations: ['fontFamily'],
    });
    if (!userInfo) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'User' }),
      );
    }
    return Either.makeRight(userInfo);
  }

  async loginPass({
    email,
    password,
    owner_space,
  }: LoginPassInput): Promise<Either<EitherError, LoginOutput>> {
    if (!email) {
      return Either.makeLeft(
        new EitherError('validation.property_cannot_empty', {
          property: 'Email',
        }),
      );
    }

    if (owner_space) {
      const hasLease = await this.propertyRepository
        .find({
          where: {
            owner_space: owner_space,
            leases: { tenant: { email: email } },
          },
        })
        .then((result) => result.length > 0);
      if (!hasLease) {
        return Either.makeLeft(new EitherError('validation.entity_not_found'));
      }
    }

    const user = await this.userRepository.findOne({
      where: { email },
      select: { password: true, id: true, status: true },
    });

    if (user) {
      if (await bcrypt.compare(password, user.password)) {
        if (user.status === UserStatusEnum.NOT_VALIDATED) {
          return Either.makeLeft(new EitherError('auth.email_not_validated'));
        }
        const payload: JWTPayloadI = { sub: user.id };
        return Either.makeRight({
          access_token: this.jwtService.sign(payload),
          owner_space: owner_space,
        });
      }
    }

    return Either.makeLeft(new EitherError('auth.credentials_do_not_match'));
  }

  async loginSms({
    phone,
    code,
    owner_space,
  }: LoginSmsInput): Promise<Either<EitherError, LoginOutput>> {
    if (!phone) {
      return Either.makeLeft(
        new EitherError('validation.property_cannot_empty', {
          property: 'Phone',
        }),
      );
    }

    if (owner_space) {
      const hasLease = await this.propertyRepository
        .find({
          where: {
            owner_space: owner_space,
            leases: { tenant: { phone: phone } },
          },
        })
        .then((result) => result.length > 0);
      if (!hasLease) {
        return Either.makeLeft(new EitherError('validation.entity_not_found'));
      }
    }

    const smsCode = await this.smsCodeRepository.findOne({
      where: { phone },
    });

    if (smsCode) {
      const user = await this.userRepository.findOne({
        where: { phone },
      });
      if (user && smsCode.code === code) {
        const payload: JWTPayloadI = { sub: user.id };
        return Either.makeRight({
          access_token: this.jwtService.sign(payload),
          owner_space: owner_space,
        });
      }
    }

    return Either.makeLeft(new EitherError('auth.credentials_do_not_match'));
  }

  async sendSmsCode({
    phone,
  }: SendSmsCodeInput): Promise<Either<EitherError, string>> {
    if (!phone) {
      return Either.makeLeft(
        new EitherError('validation.property_cannot_empty', {
          property: 'Phone',
        }),
      );
    }

    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'User' }),
      );
    }

    const code = Math.floor(100000 + Math.random() * 600000).toString();

    const twilioResponse = await this.twilioService.sendCodeMessage({
      userPhone: user.phone,
      code,
    });

    if (twilioResponse.isLeft()) {
      return Either.makeLeft(new EitherError('server.unknown_error'));
    }

    const smsCode = new SmsCode();
    smsCode.phone = user.phone;
    smsCode.code = code;
    this.smsCodeRepository.upsert(smsCode, {
      conflictPaths: ['phone'],
      upsertType: 'on-conflict-do-update',
    });

    return Either.makeRight('Ok ' + smsCode.code);
  }
  async sendChangeNumberVerificationCode({
    phone,
  }: SendSmsCodeInput): Promise<Either<EitherError, string>> {
    if (!phone) {
      return Either.makeLeft(
        new EitherError('validation.property_cannot_empty', {
          property: 'Phone',
        }),
      );
    }

    const code = Math.floor(100000 + Math.random() * 600000).toString();

    const twilioResponse = await this.twilioService.sendCodeMessage({
      userPhone: phone,
      code,
    });

    if (twilioResponse.isLeft()) {
      return Either.makeLeft(new EitherError('server.unknown_error'));
    }

    const smsCode = new SmsCode();
    smsCode.phone = phone;
    smsCode.code = code;
    this.smsCodeRepository.upsert(smsCode, {
      conflictPaths: ['phone'],
      upsertType: 'on-conflict-do-update',
    });

    return Either.makeRight('Ok ' + smsCode.code);
  }

  async changeNumberByUser(user: User, body: ChangeNumberInput) {
    const userInfo = await this.userRepository.findOne({
      where: { id: user.id },
    });

    if (!userInfo) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'user' }),
      );
    }

    if (userInfo.id !== user.id) {
      return Either.makeLeft(
        new EitherError('validation.something_goes_wrong'),
      );
    }

    const newPhone = await this.userRepository.findOne({
      where: { phone: body.phone },
    });

    if (newPhone) {
      return Either.makeLeft(new EitherError('validation.already_exist'));
    }

    const smsOldPhone = await this.smsCodeRepository.findOne({
      where: { phone: body.oldPhone },
    });

    if (smsOldPhone) {
      if (userInfo && smsOldPhone.code === body.oldSmsPhoneCode) {
        const smsCode = await this.smsCodeRepository.findOne({
          where: { phone: body.phone },
        });

        if (smsCode) {
          if (userInfo && smsCode.code === body.code) {
            userInfo.phone = body.phone;
            await this.userRepository.save(userInfo);
            return Either.makeRight(userInfo);
          } else {
            return Either.makeLeft(
              new EitherError('validation.something_goes_wrong'),
            );
          }
        }
      } else {
        return Either.makeLeft(
          new EitherError('validation.something_goes_wrong'),
        );
      }
    }
  }
  async changeNumberByAdmin(user: User, body: ChangeNumberByAdminInput) {
    const adminInfo = await this.userRepository.findOne({
      where: { id: user.id },
      select: { password: true, status: true },
    });
    const userInfo = await this.userRepository.findOne({
      where: { id: body.idUser },
    });

    if (!userInfo) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'user' }),
      );
    }

    if (user.role !== UserRoleEnum.ADMIN) {
      return Either.makeLeft(
        new EitherError('validation.something_goes_wrong'),
      );
    }

    const newPhone = await this.userRepository.findOne({
      where: { phone: body.phone },
    });

    if (newPhone) {
      return Either.makeLeft(new EitherError('validation.already_exist'));
    }

    if (await bcrypt.compare(body.password, adminInfo.password)) {
      if (userInfo) {
        userInfo.phone = body.phone;
        await this.userRepository.save(userInfo);
        return Either.makeRight(userInfo);
      } else {
        return Either.makeLeft(
          new EitherError('validation.something_goes_wrong'),
        );
      }
    } else {
      return Either.makeLeft(new EitherError('auth.credentials_do_not_match'));
    }
  }

  async emailRequest(emailRequest: string) {
    const exist = await this.userRepository.findOne({
      where: { email: emailRequest },
    });

    if (exist) {
      return Either.makeLeft(new EitherError('validation.already_exist'));
    }

    return Either.makeRight('Ok');
  }

  async resetPassword(user: User, body: resetPasswordInput) {
    const userInfo = await this.userRepository.findOne({
      where: { id: user.id },
      select: { password: true, status: true, id: true, role: true },
    });

    if (!userInfo) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'User' }),
      );
    }
    if(body.oldPassword === body.password){
      return Either.makeLeft(new EitherError('validation.something_goes_wrong'));
    }
    const newPass = await bcrypt.hash(body.password, 10);
    if (await bcrypt.compare(body.oldPassword, userInfo.password)) {
      userInfo.password = newPass;
    } else {
      return Either.makeLeft(new EitherError('auth.credentials_do_not_match'));
    }
    await this.userRepository.save(userInfo);
    return Either.makeRight('Success');
  }

  // async emailValidation(email: string) {
  //   const user = await this.userRepository.findOne({ where: { email } });
  //   if (!user) {
  //     return Either.makeRight('OK');
  //   }
  //
  //   const code = Math.floor(100000 + Math.random() * 600000).toString();
  //
  //   let emailCode = await this.emailCodeRepository.findOne({
  //     where: { email },
  //   });
  //   if (!emailCode) {
  //     emailCode = new EmailCode();
  //     emailCode.email = email;
  //   }
  //   emailCode.code = code;
  //
  //   this.emailCodeRepository.save(emailCode);
  //   try {
  //     await this.mailerService.sendMail({
  //       to: user.email,
  //       subject: 'Welcome to Auto Sensei',
  //       template: 'welcome',
  //       context: {
  //         code,
  //         name: user.firstName || user.email,
  //       },
  //     });
  //   } catch (err) {
  //     Logger.log(err);
  //     return Either.makeLeft(
  //       new HttpException('Error on mail', HttpStatus.BAD_REQUEST),
  //     );
  //   }
  //   return Either.makeRight('OK');
  // }
  //
  // async validateEmailCode(email: string, code: string) {
  //   const user = await this.userRepository.findOne({ where: { email } });
  //   if (!user)
  //     return Either.makeLeft(
  //       new HttpException('User undefined', HttpStatus.BAD_REQUEST),
  //     );
  //
  //   const emailCode = await this.emailCodeRepository.findOne({
  //     where: {
  //       email,
  //       code,
  //     },
  //   });
  //   if (!emailCode) {
  //     return Either.makeLeft(
  //       new HttpException('Code invalid', HttpStatus.BAD_REQUEST),
  //     );
  //   }
  //
  //   const payload: JWTPayloadI = { sub: user.id };
  //
  //   user.status = UserStatusEnum.ACTIVE;
  //   this.userRepository.save(user);
  //
  //   return Either.makeRight({
  //     access_token: this.jwtService.sign(payload, {
  //       expiresIn: '1h',
  //     }),
  //   });
  // }
  //
  // async forgottenPassword(email: string) {
  //   const user = await this.userRepository.findOne({ where: { email } });
  //   if (!user)
  //     return Either.makeLeft(
  //       new HttpException('User undefined', HttpStatus.BAD_REQUEST),
  //     );
  //
  //   const payload: JWTPayloadI = { sub: user.id };
  //
  //   const url = `${this.config.get(
  //     'server.frontUrl',
  //   )}/auth/recover-password?token=${this.jwtService.sign(payload, {
  //     expiresIn: '15m',
  //   })}`;
  //
  //   await this.mailerService.sendMail({
  //     to: user.email,
  //     subject: 'Password reset',
  //     template: 'forgotten-password',
  //     context: {
  //       url,
  //       name: user.firstName || user.email,
  //     },
  //   });
  //   return Either.makeRight('OK');
  // }
}
