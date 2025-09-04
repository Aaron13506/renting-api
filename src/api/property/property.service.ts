import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePropertyInput } from './inputs/register-property.input';
import { Repository } from 'typeorm';
import { Property } from 'src/database/entities/property.entity';
import { User } from 'src/database/entities/user.entity';
import { Either } from 'src/common/generics/either';
import { EitherError } from 'src/common/generics/error';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { SendEmailPropertyService } from 'src/common/services/emailPropertyService/sendEmailProperty.service';
import { SendSmsPropertyService } from 'src/common/services/smsPropertyService/sendSmsProperty.service';
import { InformationInput } from './inputs/send-information.inputs';
import { SendInformationEnum } from 'src/common/enums/send-information.enum';
import { UpdatePropertyInput } from './inputs/update-property.input';
import { PaginationOptionsDto } from '../../common/dtos/pagination-options.dto';
import { PaginationService } from '../../common/services/pagination.service';
import { SearchService } from '../../common/services/search.service';
import { SearchOptionsDto } from '../../common/dtos/search-options.dto';
import { PROPERTY_KEYS } from '../../common/generics/search-keys';
import { IndividualInformationInput } from './inputs/send-individual-information';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepository: Repository<Property>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private sendEmailService: SendEmailPropertyService,
    private sendSmsService: SendSmsPropertyService,
    private paginationService: PaginationService,
    private searchService: SearchService,
  ) {}

  async registerProperty(body: CreatePropertyInput, user: User) {
    const userF = user;

    const property = new Property();
    property.name = body.name;
    property.address = body.address;
    property.longitud = body.longitud;
    property.latitud = body.latitud;
    property.images = body.images;
    if (body.owner) {
      const owner = await this.userRepository.findOne({
        where: { id: body.owner },
      });

      if (owner.role == UserRoleEnum.ACCOUNT) {
        return Either.makeLeft(
          new EitherError('validation.something_goes_wrong'),
        );
      }
      property.owner = owner;
    } else {
      property.owner = userF;
    }

    return Either.makeRight(await this.propertyRepository.save(property));
  }

  async findAll(
    paginationOptions: PaginationOptionsDto,
    search?: SearchOptionsDto,
  ) {
    const where = this.searchService.execute(PROPERTY_KEYS, search);
    const list = await this.propertyRepository.find({
      where,
      relations: ['owner', 'leases'],
    });
    if (!list) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', {
          entity: 'Properties',
        }),
      );
    }
    return Either.makeRight(
      this.paginationService.execute<Property>(list, paginationOptions),
    );
  }

  async findOne(propertyId: string) {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
      relations: ['owner', 'leases'],
    });

    if (!property) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'property' }),
      );
    }
    return Either.makeRight(property);
  }

  async findByOwner(
    user: User,
    paginationOptions: PaginationOptionsDto,
    search?: SearchOptionsDto,
  ) {
    const condition = { owner: { id: user.id } };
    const where = this.searchService.execute<Property>(
      PROPERTY_KEYS,
      search,
      condition,
    );
    const properties = await this.propertyRepository.find({
      where,
      relations: ['leases', 'owner'],
      order: { createdAt: paginationOptions.order },
    });
    if (!properties) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', {
          entity: 'properties',
        }),
      );
    }
    return Either.makeRight(
      this.paginationService.execute<Property>(properties, paginationOptions),
    );
  }

  async updateProperty(updateFields: UpdatePropertyInput, user: User) {
    const property = await this.propertyRepository.findOne({
      where: { id: updateFields.id },
      relations: ['owner', 'leases'],
    });

    if (!property) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'property' }),
      );
    }

    if (user.role != UserRoleEnum.ADMIN && property.owner.id != user.id) {
      return Either.makeLeft(
        new EitherError('validation.something_goes_wrong'),
      );
    }

    const newOwner = await this.userRepository.findOne({
      where: { id: updateFields.newOwner },
    });

    if (!newOwner || newOwner.role != UserRoleEnum.OWNER) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'new Owner' }),
      );
    }

    property.name = updateFields.name;
    property.address = updateFields.address;
    property.images = updateFields.images;
    property.owner = newOwner;

    await this.propertyRepository.save(property);
    return Either.makeRight(property);
  }

  async sendInformationToProperty(body: InformationInput) {
    const property = await this.propertyRepository.findOne({
      where: { id: body.propertyId },
    });

    if (!property) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Property' }),
      );
    }

    const propertyTarget = property?.id;

    const selection = body.type.map((items) => items);
    if (
      selection.includes(SendInformationEnum.Email) &&
      selection.includes(SendInformationEnum.Sms)
    ) {
      const resp = 'Messages and Emails sent to property users';
      await this.sendEmailService.emailToProperty(propertyTarget, body.message);
      await this.sendSmsService.smsToProperty(propertyTarget, body.message);
      return Either.makeRight(resp);
    } else if (selection.includes(SendInformationEnum.Email)) {
      const resp = 'Email sent to property users';
      await this.sendEmailService.emailToProperty(propertyTarget, body.message);
      return Either.makeRight(resp);
    } else if (selection.includes(SendInformationEnum.Sms)) {
      const resp = 'Message sent to property users';
      await this.sendSmsService.smsToProperty(propertyTarget, body.message);
      return Either.makeRight(resp);
    } else
      return Either.makeLeft(
        new EitherError('validation.something_goes_wrong'),
      );
  }

  async sendSmsToUserFromProperty(
    body: IndividualInformationInput,
    user: User,
  ) {
    let resp = '';
    const property = await this.propertyRepository.findOne({
      where: { id: body.propertyId },
    });

    if (!property) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Property' }),
      );
    }
    const propertyTarget = property?.id;
    const userTo = await this.userRepository.findOne({
      where: { phone: body.numberTo },
    });

    if (!userTo) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'User' }),
      );
    }

    const messageResponse = await this.sendSmsService.smsToUser(
      propertyTarget,
      userTo.phone,
      body.message,
      user.id,
    );

    if (messageResponse.isLeft()) {
      resp = 'something went wrong';
    } else {
      resp = 'Message sent successfully';
    }
    return Either.makeRight(resp);
  }
}
