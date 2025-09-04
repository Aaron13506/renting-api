import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from 'src/database/entities/notification.entity';
import { User } from 'src/database/entities/user.entity';
import { Lease } from 'src/database/entities/lease.entity';
import { Billing } from 'src/database/entities/billing.entity';
import { Report } from 'src/database/entities/report.entity';
import { CreateNotificationInput } from '../dto/create-notification.input';
import { NotificationStatusEnum } from 'src/common/enums/notification-status.enum';

@Injectable()
export class CreateNotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(Billing)
    private billingRepository: Repository<Billing>,
    @InjectRepository(Lease)
    private leaseRepository: Repository<Lease>,
  ) {}
  async create(body: CreateNotificationInput) {
    const notification = new Notification();
    notification.message = body.message;
    notification.status = NotificationStatusEnum.UNREAD;

    notification.notificationType = body.notificationType;
    if (body.idUser) {
      const user = await this.userRepository.findOne({
        where: { id: body.idUser },
      });
      notification.user = user;
    }

    if (body.idReport) {
      const report = await this.reportRepository.findOne({
        where: { id: body.idReport },
      });
      notification.report = report;
    } else {
      notification.report = null;
    }

    if (body.idBilling) {
      const billing = await this.billingRepository.findOne({
        where: { id: body.idBilling },
      });
      notification.bill = billing;
    } else {
      notification.bill = null;
    }

    if (body.idLease) {
      const lease = await this.leaseRepository.findOne({
        where: { id: body.idLease },
      });
      notification.lease = lease;
    } else {
      notification.lease = null;
    }

    await this.notificationRepository.save(notification);

    return 'New notification created';
  }
}
