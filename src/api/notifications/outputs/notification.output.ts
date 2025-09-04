import { ObjectType } from '@nestjs/graphql';
import { PaginationOutput } from '../../../common/generics/pagination.output';
import { Notification } from 'src/database/entities/notification.entity';

@ObjectType()
export class NotificationOutput extends PaginationOutput(Notification) {}
