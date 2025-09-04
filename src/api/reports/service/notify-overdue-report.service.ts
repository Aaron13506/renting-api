import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateNotificationsService } from 'src/api/notifications/service/create-notification.service';
import { ReportStatusEnum } from 'src/common/enums/report-status.enum';
import { Either } from 'src/common/generics/either';
import TwilioService from 'src/common/services/twilio.service';
import { Report } from 'src/database/entities/report.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotifyOverdueReportService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    private readonly twilioService: TwilioService,
    private readonly mailerService: MailerService,
    private configService: ConfigService,
    private readonly notificationService: CreateNotificationsService,
  ) {}
  async notifyOverdueReport() {
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
    const url = this.configService.get<string>('server.frontUrl');

    for (const report of reports) {
      if (report.status === ReportStatusEnum.IN_REVIEW) {
        const actualDate = new Date().getTime();
        const estimatedDate = report.estimated_date?.getTime();
        const minId = report.id.slice(-8).toUpperCase();

        if (actualDate > estimatedDate) {
          await this.mailerService.sendMail({
            to: report.lease.property.owner?.email,
            subject: 'Your maintance request is overdue',
            template: './reportOverdue',
            context: {
              propertyName: report.lease.property.name.toUpperCase(),
              leaseCode: report.lease.code,
              name: `${report.lease.tenant.firstName} ${report.lease.tenant.lastName}`,
              date: report.createdAt.toString(),
              message: `Your maintance request ${minId} is overdue! Please check it out ${url}`,
            },
          });

          respT =  await this.twilioService.sendNotificationReportStatusPendingMessage({
            userPhone: report.lease.property.owner?.phone,
            id: report.id.slice(-8).toUpperCase(),
            reason: ReportStatusEnum.IN_REVIEW,
          });

          await this.notificationService.create({
            message: respT.getRight().toString(),
            idUser: report.lease.property.owner?.id,
            idLease: null,
            idBilling: null,
            idReport: report.id,
            notificationType: 'Overdue Report Notification',
          });
        }
      }
    }

    return Either.makeRight('ok');
  }
}
