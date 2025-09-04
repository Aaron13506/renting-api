import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationOptionsDto } from 'src/common/dtos/pagination-options.dto';
import { SearchOptionsDto } from 'src/common/dtos/search-options.dto';
import { NotificationStatusEnum } from 'src/common/enums/notification-status.enum';
import { Either } from 'src/common/generics/either';
import { EitherError } from 'src/common/generics/error';
import { NOTIFICATION_KEYS } from 'src/common/generics/search-keys';
import { PaginationService } from 'src/common/services/pagination.service';
import { SearchService } from 'src/common/services/search.service';
import { Notification } from 'src/database/entities/notification.entity';
import { User } from 'src/database/entities/user.entity';
import { FindOptionsWhere, Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private readonly paginationService: PaginationService,
    private readonly searchService: SearchService,
  ) {}
  async findAll(
    paginationOptions: PaginationOptionsDto,
    search?: SearchOptionsDto,
  ) {
    const where = this.searchService.execute(NOTIFICATION_KEYS, search);
    const notificationList = await this.notificationRepository.find({
      where,
      order: { createdAt: paginationOptions.order },
      relations: ['lease', 'bill', 'report', 'user'],
    });

    if (!notificationList) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', {
          entity: 'Notifications',
        }),
      );
    }
    return Either.makeRight(
      this.paginationService.execute<Notification>(
        notificationList,
        paginationOptions,
      ),
    );
  }

  async findOne(idNotification: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: idNotification },
      relations: ['lease', 'bill', 'report', 'user'],
    });

    if (!notification) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', {
          entity: 'Notification',
        }),
      );
    }
    return Either.makeRight(notification);
  }

  async findByUser(
    user: User,
    paginationOptions: PaginationOptionsDto,
    search?: SearchOptionsDto,
  ) {
    const whereCondition: FindOptionsWhere<Notification> = {
      user: { id: user.id },
    };

    const where = this.searchService.execute(
      NOTIFICATION_KEYS,
      search,
      whereCondition,
    );
    const notifications = await this.notificationRepository.find({
      where,
      relations: ['lease', 'bill', 'report', 'user'],
      order: { createdAt: paginationOptions.order },
    });

    if (!notifications) {
      return Either.makeRight([]);
    }
    return Either.makeRight(
      this.paginationService.execute<Notification>(
        notifications,
        paginationOptions,
      ),
    );
  }

  async setReadNotification(idNotification: string, user: User) {
    const notification = await this.notificationRepository.findOne({
      where: { id: idNotification },
      relations: ['lease', 'bill', 'report', 'user'],
    });

    if (user.id != notification.user.id) {
      return Either.makeLeft(
        new EitherError('validation.you_cannot_do_this_action'),
      );
    }

    notification.status = NotificationStatusEnum.READ;
    await this.notificationRepository.save(notification);
    return Either.makeRight(notification);
  }

  async remove(idNotification: string, user: User) {
    const notification = await this.notificationRepository.findOne({
      where: { id: idNotification },
      relations: ['lease', 'bill', 'report', 'user'],
    });
    if (user.id != notification.user.id) {
      return Either.makeLeft(
        new EitherError('validation.you_cannot_do_this_action'),
      );
    }
    await this.notificationRepository.remove(notification);
    return Either.makeRight(`Notification successfully deleted `);
  }
}
