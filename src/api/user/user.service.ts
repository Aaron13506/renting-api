import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserInput } from './inputs/create-user.input';
import { UpdateUserInput } from './inputs/update-user.input';
import { User } from 'src/database/entities/user.entity';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { Either } from 'src/common/generics/either';
import { EitherError } from 'src/common/generics/error';
import { SetEmailPassInput } from './inputs/email-password.input';
import TwilioService from 'src/common/services/twilio.service';
import { OwnerSpaceInput } from '../../common/inputs/owner-space.input';
import { UserStatusEnum } from 'src/common/enums/user-status.enum';
import { Font } from 'src/database/entities/fonts.entity';
import { PaginationService } from 'src/common/services/pagination.service';
import { PaginationOptionsDto } from '../../common/dtos/pagination-options.dto';
import { UpdateOwnerInput } from './inputs/update-owner.input';
import { SearchService } from '../../common/services/search.service';
import { SearchOptionsDto } from '../../common/dtos/search-options.dto';
import { USER_KEYS } from '../../common/generics/search-keys';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private twilioService: TwilioService,
    private PaginationService: PaginationService,
    @InjectRepository(Font)
    private fontRepository: Repository<Font>,
    private searchService: SearchService,
  ) {}

  async create(bodyInput: CreateUserInput, userCreate: User) {
    const userC = userCreate;
    const phone = await this.userRepository.findOne({
      where: { phone: bodyInput.phone },
    });

    const email = await this.userRepository.findOne({
      where: { email: bodyInput.email },
    });

    if (email && bodyInput.email) {
      return Either.makeLeft(new EitherError('validation.already_exist'));
    }

    if (phone) {
      return Either.makeLeft(new EitherError('validation.already_exist'));
    }
    const user = new User();
    user.firstName = bodyInput.firstName;
    user.lastName = bodyInput.lastName;
    user.image = bodyInput.image;
    user.phone = bodyInput.phone;
    user.email = bodyInput.email;
    user.role = UserRoleEnum.ACCOUNT;
    user.createdBy = userC;
    user.status = UserStatusEnum.ACTIVE;

    await this.twilioService.sendWelcomeMessage({
      userPhone: bodyInput.phone,
    });

    return Either.makeRight(await this.userRepository.save(user));
  }

  async findAll(
    paginationOptions: PaginationOptionsDto,
    search?: SearchOptionsDto,
  ) {
    const where = this.searchService.execute(USER_KEYS, search);
    const usersList = await this.userRepository.find({
      where,
      order: { createdAt: paginationOptions.order },
      relations: ['properties', 'leases'],
    });
    if (!usersList) {
      return Either.makeLeft('not found');
    }
    return Either.makeRight(
      this.PaginationService.execute<User>(usersList, paginationOptions),
    );
  }

  async findOne(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['properties', 'leases.tenant', 'fontFamily'],
    });
    if (!user) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'User' }),
      );
    }

    return Either.makeRight(user);
  }

  async findTenantsByOwner(
    user: User,
    paginationOptions: PaginationOptionsDto,
    owner_space?: OwnerSpaceInput,
    search?: SearchOptionsDto,
  ) {
    const whereCondition: FindOptionsWhere<User> = {
      role: UserRoleEnum.ACCOUNT,
      createdBy: { id: user.id },
      leases: {},
    };

    if (owner_space?.owner_space) {
      whereCondition.leases = {
        property: { owner_space: owner_space.owner_space },
      };
    }
    const where = this.searchService.execute(USER_KEYS, search, whereCondition);
    const list = await this.userRepository.find({
      where,
      relations: ['createdBy', 'leases.property'],
      order: { createdAt: paginationOptions.order },
    });
    if (!list) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'User' }),
      );
    }

    return Either.makeRight(
      this.PaginationService.execute<User>(list, paginationOptions),
    );
  }

  async findByRoles(
    roles: UserRoleEnum,
    paginationOptions: PaginationOptionsDto,
    search?: SearchOptionsDto,
  ) {
    const condition = { role: roles };
    const where = this.searchService.execute<User>(
      USER_KEYS,
      search,
      condition,
    );
    const list = await this.userRepository.find({
      where,
      relations: ['properties', 'leases', 'fontFamily'],
      order: { createdAt: paginationOptions.order },
    });
    if (!list) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Users' }),
      );
    }

    return Either.makeRight(
      this.PaginationService.execute<User>(list, paginationOptions),
    );
  }

  async update(updateUserInput: UpdateUserInput, user: User) {
    const userInfo = user;
    if (!user) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'user' }),
      );
    }

    if (updateUserInput.email && updateUserInput.email !== userInfo.email) {
      const email = await this.userRepository.findOne({
        where: { email: updateUserInput.email },
      });

      if (email) {
        return Either.makeLeft(new EitherError('validation.already_exist'));
      }
    }

    if (updateUserInput.phone && updateUserInput.phone !== userInfo.phone) {
      const phone = await this.userRepository.findOne({
        where: { email: updateUserInput.email },
      });

      if (phone) {
        return Either.makeLeft(new EitherError('validation.already_exist'));
      }
    }
    const oldEmail = userInfo.email;

    for (const key of Object.keys(updateUserInput)) {
      userInfo[key] = updateUserInput[key];
      if (updateUserInput.email) {
        userInfo.email = updateUserInput.email;
      } else {
        userInfo.email = oldEmail;
      }
    }

    await this.userRepository.save(user);

    return Either.makeRight(user);
  }

  async updateOwner(updateOwnerFields: UpdateOwnerInput, user: User) {
    const owner = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['fontFamily'],
    });

    if (updateOwnerFields.email && updateOwnerFields.email !== owner.email) {
      const newEmail = await this.userRepository.findOne({
        where: { email: updateOwnerFields.email },
      });

      if (newEmail) {
        return Either.makeLeft(new EitherError('validation.already_exist'));
      }
    }
    const fontF = await this.fontRepository.findOne({
      where: { id: updateOwnerFields.fontFamily },
    });

    if (!owner) {
      return Either.makeLeft(
        new EitherError('validation.something_goes_wrong'),
      );
    }
    const oldFamily = owner.fontFamily;
    const oldEmail = owner.email;

    for (const key of Object.keys(updateOwnerFields)) {
      owner[key] = updateOwnerFields[key];

      if (updateOwnerFields.fontFamily) {
        owner.fontFamily = fontF;
      } else {
        owner.fontFamily = oldFamily;
      }
      if (updateOwnerFields.email) {
        owner.email = updateOwnerFields.email;
      } else {
        owner.email = oldEmail;
      }
    }
    await this.userRepository.save(owner);

    return Either.makeRight(owner);
  }

  async updateTenantByAdmin(
    updateUserFields: UpdateUserInput,
    idTenant: string,
  ) {
    const tenant = await this.userRepository.findOne({
      where: { id: idTenant },
    });
    if (!tenant) {
      return Either.makeLeft(
        new EitherError('validation.something_goes_wrong'),
      );
    }

    if (updateUserFields.email && updateUserFields.email !== tenant.email) {
      const email = await this.userRepository.findOne({
        where: { email: updateUserFields.email },
      });

      if (email) {
        return Either.makeLeft(new EitherError('validation.already_exist'));
      }
    }
    const oldEmail = tenant.email;

    for (const key of Object.keys(updateUserFields)) {
      tenant[key] = updateUserFields[key];
      if (updateUserFields.email) {
        tenant.email = updateUserFields.email;
      } else {
        tenant.email = oldEmail;
      }
    }
    await this.userRepository.save(tenant);

    return Either.makeRight(tenant);
  }

  async updateOwnerByAdmin(
    updateOwnerFields: UpdateOwnerInput,
    idOwner: string,
  ) {
    const owner = await this.userRepository.findOne({
      where: { id: idOwner },
      relations: ['fontFamily'],
    });

    if (updateOwnerFields.email && updateOwnerFields.email !== owner.email) {
      const email = await this.userRepository.findOne({
        where: { email: updateOwnerFields.email },
      });

      if (email) {
        return Either.makeLeft(new EitherError('validation.already_exist'));
      }
    }

    const fontF = await this.fontRepository.findOne({
      where: { id: updateOwnerFields.fontFamily },
    });

    if (!owner) {
      return Either.makeLeft(
        new EitherError('validation.something_goes_wrong'),
      );
    }
    const oldEmail = owner.email;
    const oldFamily = owner.fontFamily;
    for (const key of Object.keys(updateOwnerFields)) {
      owner[key] = updateOwnerFields[key];
      if (updateOwnerFields.fontFamily) {
        owner.fontFamily = fontF;
      } else {
        owner.fontFamily = oldFamily;
      }
      if (updateOwnerFields.email) {
        owner.email = updateOwnerFields.email;
      } else {
        owner.email = oldEmail;
      }
    }
    await this.userRepository.save(owner);
    return Either.makeRight(owner);
  }

  async setEmailPass(body: SetEmailPassInput) {
    const user = await this.userRepository.findOne({
      where: { id: body.user },
    });

    const email = await this.userRepository.findOne({
      where: { email: body.email },
    });

    if (email) {
      return Either.makeLeft(new EitherError('validation.already_exist'));
    }

    if (!user) {
      return Either.makeLeft(new EitherError('validation.entity_not_found'));
    }

    user.email = body.email;
    user.password = await bcrypt.hash(body.password, 10);

    await this.userRepository.save(user);
    return Either.makeRight(user);
  }

  async deactivateActiveTenant(user: User, idTenant: string) {
    const tenant = await this.userRepository.findOne({
      where: { id: idTenant },
      relations: ['leases', 'createdBy'],
    });

    if (!tenant) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'tenant' }),
      );
    }

    if (tenant.createdBy.id !== user.id && user.role !== UserRoleEnum.ADMIN) {
      return Either.makeLeft(
        new EitherError('validation.something_goes_wrong'),
      );
    } else {
      if (tenant.status == UserStatusEnum.ACTIVE) {
        tenant.status = UserStatusEnum.INACTIVE;

        await this.userRepository.save(tenant);
        return Either.makeRight(tenant);
      } else if (tenant.status == UserStatusEnum.INACTIVE) {
        tenant.status = UserStatusEnum.ACTIVE;

        await this.userRepository.save(tenant);
        return Either.makeRight(tenant);
      }
    }
  }
}
