import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { NotificationsService } from './notifications.service';
import { Notification } from 'src/database/entities/notification.entity';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { AuthRequest } from 'src/common/decorators/auth-request';
import { SearchOptionsDto } from 'src/common/dtos/search-options.dto';
import { PaginationOptionsDto } from 'src/common/dtos/pagination-options.dto';
import { UserD } from 'src/common/decorators/user.decorator';
import { User } from 'src/database/entities/user.entity';
import { NotificationOutput } from './outputs/notification.output';

@Resolver(() => Notification)
export class NotificationsResolver {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Query(() => NotificationOutput, { name: 'AllNotifications' })
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN],
  })
  findAll(
    @Args('paginationOptions') paginationOptions: PaginationOptionsDto,
    @Args('search', { nullable: true }) search?: SearchOptionsDto,
  ) {
    return this.notificationsService.findAll(paginationOptions, search);
  }

  @Query(() => Notification!, { name: 'notificationById' })
  @AuthRequest()
  findOne(@Args('idNotication', { type: () => String }) idNotication: string) {
    return this.notificationsService.findOne(idNotication);
  }

  @Query(() => NotificationOutput, { name: 'notificationByUser' })
  @AuthRequest()
  findNotificationsByUser(
    @UserD() user: User,
    @Args('paginationOptions') paginationOptions: PaginationOptionsDto,
    @Args('search', { nullable: true }) search?: SearchOptionsDto,
  ) {
    return this.notificationsService.findByUser(
      user,
      paginationOptions,
      search,
    );
  }

  @Mutation(() => Notification!)
  @AuthRequest()
  setReadNotification(
    @Args('idNotification', { type: () => String }) idNotification: string,
    @UserD() user: User,
  ) {
    return this.notificationsService.setReadNotification(idNotification, user);
  }

  @Mutation(() => String!)
  @AuthRequest()
  removeNotification(
    @Args('idNotification', { type: () => String }) idNotification: string,
    @UserD() user: User,
  ) {
    return this.notificationsService.remove(idNotification, user);
  }
}
