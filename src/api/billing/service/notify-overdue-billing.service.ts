import { AppServiceI } from '../../../common/generics/app-service.interface';
import { Billing } from '../../../database/entities/billing.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingStatusEnum } from '../../../common/enums/billing-status.enum';
import { MailerService } from '@nestjs-modules/mailer';
import TwilioService from '../../../common/services/twilio.service';
import { Either } from '../../../common/generics/either';
import { EitherError } from '../../../common/generics/error';
import { User } from '../../../database/entities/user.entity';
import { CreateNotificationsService } from 'src/api/notifications/service/create-notification.service';

type P = unknown;
type R = string;

export class NotifyOverdueBillingService implements AppServiceI<P, R> {
  constructor(
    @InjectRepository(Billing)
    private readonly billingRepository: Repository<Billing>,
    private readonly twilioService: TwilioService,
    private readonly mailerService: MailerService,
    private readonly notificationService: CreateNotificationsService,
  ) {}

  async execute() {
    let respT;
    const billings = await this.billingRepository
      .createQueryBuilder('bi')
      .leftJoinAndSelect('bi.lease', 'le')
      .leftJoinAndSelect('le.property', 'pr')
      .leftJoinAndSelect('le.tenant', 'te')
      .where('bi.status = :status', { status: BillingStatusEnum.OVERDUE })
      .getMany();

    const leaseOverdueMap = new Map<
      string,
      {
        totalAmount: number;
        firstBillingDate: Date;
        user: User;
        propertyName: string;
        leaseCode: string;
      }
    >();

    for (const billing of billings) {
      const leaseId = billing.lease.id;
      if (!leaseOverdueMap.has(leaseId)) {
        leaseOverdueMap.set(leaseId, {
          totalAmount: 0,
          firstBillingDate: billing.date,
          user: billing.lease.tenant,
          propertyName: billing.lease.property.name,
          leaseCode: billing.lease.code,
        });
      }
      const leaseData = leaseOverdueMap.get(leaseId);
      leaseData.totalAmount += billing.amount;
      if (billing.date < leaseData.firstBillingDate) {
        leaseData.firstBillingDate = billing.date;
      }
    }

    for (const [, leaseData] of leaseOverdueMap.entries()) {
      if (!leaseData.user) {
        continue;
      }
      const date = leaseData.firstBillingDate.toDateString().slice(4);
      if (leaseData.user.email) {
        await this.mailerService.sendMail({
          to: leaseData.user.email,
          subject: 'Overdue Rent Notification',
          template: './overdue', // The name of the template file
          context: {
            propertyName: `"${leaseData.propertyName}"`,
            lease: leaseData.leaseCode,
            name: `${leaseData.user.firstName} ${leaseData.user.lastName}`,
            amount: leaseData.totalAmount,
            date,
          },
        });
      }
      if (leaseData.user.phone) {
        respT = await this.twilioService.sendOverdueMessage({
          leaseCode: leaseData.leaseCode,
          propertyName: `"${leaseData.propertyName}"`,
          amount: leaseData.totalAmount,
          userPhone: leaseData.user.phone,
          date,
        });

        await this.notificationService.create({
          message: respT.getRight().toString(),
          idUser: leaseData.user.id,
          idLease: null,
          idBilling: null,
          idReport: null,
          notificationType: 'Billing Overdue Notification',
        });
      }
    }
    return Either.makeRight<EitherError, R>('OK');
  }
}
