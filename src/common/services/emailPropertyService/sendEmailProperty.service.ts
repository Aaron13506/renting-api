import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Either } from 'src/common/generics/either';
import { EitherError } from 'src/common/generics/error';
import { Property } from 'src/database/entities/property.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SendEmailPropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    private readonly mailService: MailerService,
  ) {}

  async emailToProperty(id: string, message: string) {
    const emails = [];
    const property = await this.propertyRepository.findOne({
      where: { id: id },
      relations: ['owner', 'leases', 'leases.tenant'],
    });

    if (!property) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Property' }),
      );
    }

    const eamilLeases = property?.leases.map((items) => items.tenant?.email);
    const emailLeasesF = eamilLeases.filter((item, index) => {
      return eamilLeases.indexOf(item) === index;
    });

    emailLeasesF.push('marcosivd8@gmail.com');
    for (const elements of emailLeasesF) {
      emails.push(elements);
    }
    this.mailService.sendMail({
      to: emailLeasesF.map((items) => items),
      subject: `Information to ${property.name} property user's`,
      template: 'reports-challenge-alert',
      context: {
        message: message,
      },
    });

    return 'ok';
  }
}
