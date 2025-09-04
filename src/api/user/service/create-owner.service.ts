import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from 'src/database/entities/user.entity';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { OwnerInput } from '../inputs/create-owner.input';
import { Either } from 'src/common/generics/either';
import { EitherError } from 'src/common/generics/error';
import TwilioService from 'src/common/services/twilio.service';
import { Font } from 'src/database/entities/fonts.entity';

@Injectable()
export class OwnerService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Font)
    private fontRepository: Repository<Font>,
    private twilioService: TwilioService,
  ) {}

  async createOwner(bodyInput: OwnerInput) {
    const phone = await this.userRepository.findOne({
      where: { phone: bodyInput.phone },
    });
 if(bodyInput.email){
  const email = await this.userRepository.findOne({
    where: { email: bodyInput.email },
  });

  if(email){
    return Either.makeLeft(new EitherError('validation.already_exist'));
  }
 }
    const fontF = bodyInput.fontFamily
      ? await this.fontRepository.findOne({
          where: { id: bodyInput.fontFamily },
        })
      : null;

    if (phone ) {
      return Either.makeLeft(new EitherError('validation.already_exist'));
    }

    const owner = new User();
    owner.firstName = bodyInput.firstName;
    owner.lastName = bodyInput.lastName;
    owner.image = bodyInput.image;
    owner.phone = bodyInput.phone;
    owner.fontFamily = fontF;
    owner.fontWeight = bodyInput.fontWeight;
    owner.navBgColor = bodyInput.navBgColor;
    owner.textColor = bodyInput.textColor;
    owner.secondTextColor = bodyInput.secondTextColor;
    owner.borderColor = bodyInput.borderColor;
    owner.buttonsColor = bodyInput.buttonsColor;
    owner.iconsColor = bodyInput.iconsColor;
    owner.hoverColor = bodyInput.hoverColor;
    owner.email = bodyInput.email;
    owner.role = UserRoleEnum.OWNER;

    await this.twilioService.sendWelcomeMessage({ userPhone: bodyInput.phone });

    return Either.makeRight(await this.userRepository.save(owner));
  }
}
