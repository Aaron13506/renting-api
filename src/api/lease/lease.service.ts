import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Either } from 'src/common/generics/either';
import { EitherError } from 'src/common/generics/error';
import { Lease } from 'src/database/entities/lease.entity';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { OwnerSpaceInput } from '../../common/inputs/owner-space.input';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { LeaseStatusEnum } from 'src/common/enums/lease-status.enum';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { PaginationOptionsDto } from '../../common/dtos/pagination-options.dto';
import { PaginationService } from '../../common/services/pagination.service';
import { LEASE_KEYS } from '../../common/generics/search-keys';
import { SearchService } from '../../common/services/search.service';
import { SearchOptionsDto } from '../../common/dtos/search-options.dto';

@Injectable()
export class LeaseService {
  constructor(
    @InjectRepository(Lease)
    private readonly leaseRepository: Repository<Lease>,
    private readonly paginationService: PaginationService,
    private readonly searchService: SearchService,
  ) {}

  async findAll(
    paginationOptions: PaginationOptionsDto,
    search?: SearchOptionsDto,
  ) {
    const where = this.searchService.execute(LEASE_KEYS, search);
    const leaseList = await this.leaseRepository.find({
      order: { createdAt: paginationOptions.order },
      relations: ['property', 'tenant', 'document', 'document.version'],
      where,
    });

    if (!leaseList) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Leases' }),
      );
    }
    return Either.makeRight(
      this.paginationService.execute<Lease>(leaseList, paginationOptions),
    );
  }

  async findLeaseById(idLease: string) {
    const lease = await this.leaseRepository.findOne({
      where: { id: idLease },
      relations: [
        'property',
        'tenant',
        'property',
        'reports',
        'billings',
        'property.owner',
        'document',
        'document.version',
      ],
    });

    if (!lease) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'lease' }),
      );
    }
    return Either.makeRight(lease);
  }

  async findLeasesByOwnerId(
    idOwner: string,
    paginationOptions: PaginationOptionsDto,
    search?: SearchOptionsDto,
  ) {
    const condition = { property: { owner: { id: idOwner } } };
    const where = this.searchService.execute<Lease>(
      LEASE_KEYS,
      search,
      condition,
    );
    const leases = await this.leaseRepository.find({
      where,
      relations: ['tenant', 'property', 'document', 'document.version'],
      order: { createdAt: paginationOptions.order },
    });

    if (!leases) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Leases' }),
      );
    }
    return Either.makeRight(
      this.paginationService.execute<Lease>(leases, paginationOptions),
    );
  }

  async findLeasesByTenantId(
    idTenant: string,
    paginationOptions: PaginationOptionsDto,
    search?: SearchOptionsDto,
  ) {
    const condition = { tenant: { id: idTenant } };
    const where = this.searchService.execute<Lease>(
      LEASE_KEYS,
      search,
      condition,
    );
    const leases = await this.leaseRepository.find({
      where,
      relations: ['property', 'tenant', 'document', 'document.version'],
      order: { createdAt: paginationOptions.order },
    });

    if (!leases) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Leases' }),
      );
    }
    return Either.makeRight(
      this.paginationService.execute<Lease>(leases, paginationOptions),
    );
  }

  async findLeasesByOwnerAndTenantId(
    idTenant: string,
    user: User,
    paginationOptions: PaginationOptionsDto,
    search?: SearchOptionsDto,
  ) {
    const condition = {
      property: { owner: { id: user.id } },
      tenant: { id: idTenant },
    };
    const where = this.searchService.execute<Lease>(
      LEASE_KEYS,
      search,
      condition,
    );
    const leases = await this.leaseRepository.find({
      where,
      relations: [
        'property',
        'tenant',
        'billings',
        'reports',
        'document',
        'document.version',
      ],
      order: { createdAt: paginationOptions.order },
    });

    if (!leases) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Leases' }),
      );
    }

    return Either.makeRight(
      this.paginationService.execute<Lease>(leases, paginationOptions),
    );
  }

  async findLeasesByOwner(
    user: User,
    paginationOptions: PaginationOptionsDto,
    search?: SearchOptionsDto,
    input?: OwnerSpaceInput,
  ) {
    const whereCondition: FindOptionsWhere<Lease> = {
      property: { owner: { id: user.id } },
    };
    if (input?.owner_space) {
      whereCondition.property = { id: input.owner_space };
    }
    const where = this.searchService.execute(
      LEASE_KEYS,
      search,
      whereCondition,
    );
    const leases = await this.leaseRepository.find({
      where,
      relations: [
        'property',
        'tenant',
        'billings',
        'reports',
        'document',
        'document.version',
      ],
      order: { createdAt: paginationOptions.order },
    });

    if (!leases) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Leases' }),
      );
    }
    return Either.makeRight(
      this.paginationService.execute<Lease>(leases, paginationOptions),
    );
  }

  async findLeasesByTenant(
    user: User,
    paginationOptions: PaginationOptionsDto,
    search?: SearchOptionsDto,
    input?: OwnerSpaceInput,
  ) {
    const whereCondition: FindOptionsWhere<Lease> = { tenant: { id: user.id } };

    if (input?.owner_space) {
      whereCondition.property = { id: input.owner_space };
    }
    const where = this.searchService.execute(
      LEASE_KEYS,
      search,
      whereCondition,
    );
    const leases = await this.leaseRepository.find({
      where,
      relations: [
        'property',
        'tenant',
        'billings',
        'reports',
        'document',
        'document.version',
      ],
      order: { createdAt: paginationOptions.order },
    });

    if (!leases) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Leases' }),
      );
    }
    return Either.makeRight(
      this.paginationService.execute<Lease>(leases, paginationOptions),
    );
  }

  async findTenantsByOwnerProperties(
    user: User,
    paginationOptions: PaginationOptionsDto,
    search?: SearchOptionsDto,
  ) {
    const condition = { property: { owner: { id: user.id } } };
    const where = this.searchService.execute<Lease>(
      LEASE_KEYS,
      search,
      condition,
    );
    const list = await this.leaseRepository.find({
      where,
      relations: [
        'property',
        'tenant',
        'billings',
        'reports',
        'document',
        'document.version',
      ],
      order: { createdAt: paginationOptions.order },
    });

    if (!list) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Leases' }),
      );
    }

    return Either.makeRight(
      this.paginationService.execute<Lease>(list, paginationOptions),
    );
  }

  async deactivateActiveLease(user: User, idLease: string) {
    const lease = await this.leaseRepository.findOne({
      where: { id: idLease },
      relations: [
        'tenant',
        'property',
        'property.owner',
        'billings',
        'reports',
        'document',
        'document.version',
      ],
    });

    if (!lease) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Leases' }),
      );
    }
    if (
      lease.property.owner.id !== user.id ||
      user.role !== UserRoleEnum.ADMIN
    ) {
      return Either.makeLeft(
        new EitherError('validation.something_goes_wrong'),
      );
    }

    lease.status =
      lease.status === LeaseStatusEnum.ACTIVE
        ? LeaseStatusEnum.INACTIVE
        : LeaseStatusEnum.ACTIVE;

    await this.leaseRepository.save(lease);
    return Either.makeRight(lease);
  }
}
