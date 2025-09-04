import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Property } from 'src/database/entities/property.entity';
import { Repository } from 'typeorm';
import TwilioService from '../twilio.service';
import { Either } from 'src/common/generics/either';
import { EitherError } from 'src/common/generics/error';
import { CommunityMessage } from 'src/database/entities/community-message.entity';
import { User } from 'src/database/entities/user.entity';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';

@Injectable()
export class SendSmsPropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CommunityMessage)
    private communityMessageRepository: Repository<CommunityMessage>,
    private readonly twilioService: TwilioService,
  ) {}

  async smsToProperty(id: string, message: string) {
    const numbers = [];
    let resp = '';
    const property = await this.propertyRepository.findOne({
      where: { id: id },
      relations: ['owner', 'leases', 'leases.tenant', 'leases.property'],
    });
    if (!property) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Property' }),
      );
    }

    const leasesNumbers = property?.leases.map((items) => items.tenant?.phone);
    const leasesF = leasesNumbers.filter((item, index) => {
      return leasesNumbers.indexOf(item) === index;
    });

    for (const elements of leasesF) {
      numbers.push(elements);
    }

    for (let i = 0; i < numbers.length; i++) {
      try {
        this.twilioService.SendRawMessage({
          numbers: numbers[i],
          message: message,
          property: property.name,
        });
      } catch (error) {
        resp = error;
      }
    }
    const communityMessage = new CommunityMessage();
    communityMessage.message = message;
    communityMessage.property = property;
    communityMessage.userFrom = property.owner;

    await this.communityMessageRepository.save(communityMessage);

    resp = 'ok';
    return Either.makeRight(resp);
  }

  async smsToUser(
    idProperty: string,
    numUserTo: string,
    message: string,
    idUserFrom: string,
  ) {
    let resp = '';
    const property = await this.propertyRepository.findOne({
      where: { id: idProperty },
      relations: ['owner', 'leases', 'leases.tenant', 'leases.property'],
    });
    if (!property) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Property' }),
      );
    }

    const user = await this.userRepository.findOne({
      where: { phone: numUserTo },
    });

    if (!user) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Property' }),
      );
    }

    const userFrom = await this.userRepository.findOne({
      where: { id: idUserFrom },
    });

    if (userFrom.role != UserRoleEnum.ADMIN) {
      const leasesNumbers = property?.leases.map(
        (items) => items.tenant?.phone,
      );
      const userTo = leasesNumbers.find((item) => item === numUserTo);
      if (!userTo) {
        return Either.makeLeft(
          new EitherError('validation.entity_not_found', { entity: 'User' }),
        );
      } else {
        try {
          this.twilioService.sendIndividualMessageToUser({
            numberTo: userTo,
            message: message,
            propertyName: property.name,
            isAdmin: false,
          });
        } catch (error) {
          resp = error;
        }
      }
    } else {
      try {
        this.twilioService.sendIndividualMessageToUser({
          numberTo: user.phone,
          message: message,
          propertyName: property.name,
          isAdmin: true,
        });
      } catch (error) {
        resp = error;
      }
    }

    const communityMessage = new CommunityMessage();
    communityMessage.message = message;
    communityMessage.property = property;
    communityMessage.userFrom = userFrom;
    communityMessage.userTo = user;
    communityMessage.individualMessage = true;

    await this.communityMessageRepository.save(communityMessage);

    resp = 'ok';
    return Either.makeRight(resp);
  }
}
