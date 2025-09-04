import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNotificationsService } from 'src/api/notifications/service/create-notification.service';
import { ReportStatusEnum } from 'src/common/enums/report-status.enum';
import { Either } from 'src/common/generics/either';
import TwilioService from 'src/common/services/twilio.service';
import { Report } from 'src/database/entities/report.entity';
import { Repository } from 'typeorm';
@Injectable()
export class NotifyPendingReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly twilioService: TwilioService,
    private readonly mailerService: MailerService,
    private readonly notificationService: CreateNotificationsService,
  ) {}
  async notifyPendingReport() {
    let respT;
    const reports = await this.reportRepository
      .createQueryBuilder('re')
      .leftJoinAndSelect('re.lease', 'le')
      .leftJoinAndSelect('le.property', 'pr')
      .leftJoinAndSelect('pr.owner', 'ow')
      .leftJoinAndSelect('le.tenant', 'te')
      .where((qb) => {
        qb.where({});
      })
      .getMany();

    const fiveDays = 5 * 24 * 60 * 60 * 1000;
    for (const report of reports) {
      if (report.status === ReportStatusEnum.PENDING) {
        const timeDifference =
          new Date().getTime() - report.createdAt.getTime();

        if (timeDifference > fiveDays) {
          await this.mailerService.sendMail({
            to: report.lease.property.owner?.email,
            subject: 'You have a maintanance request from 5 days ago',
            template: './reportStatusPending',
            context: {
              propertyName: report.lease.property.name,
              leaseCode: report.lease.code,
              name: `${report.lease.tenant.firstName} ${report.lease.tenant.lastName}`,
              date: report.createdAt.toString(),
            },
          });
            respT = await this.twilioService.sendNotificationReportStatusPendingMessage(
              {
                userPhone: report.lease.property.owner?.phone,
                id: report.id.slice(-8).toUpperCase(),
              },
            );

          await this.notificationService.create({
            message: respT.getRight().toString(),
            idUser: report.lease.property.owner?.id,
            idLease: null,
            idBilling: null,
            idReport: report.id,
            notificationType: 'Report pending notification',
          });
        }
      }
    }
    return Either.makeRight('ok');
  }
}
