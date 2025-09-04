import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lease } from 'src/database/entities/lease.entity';
import { Repository } from 'typeorm';
import { ReportPriorityEnum } from '../../common/enums/report-priority.enum';
import { ReportStatusEnum } from '../../common/enums/report-status.enum';
import { Either } from '../../common/generics/either';
import { EitherError } from '../../common/generics/error';
import { Report } from '../../database/entities/report.entity';
import { User } from '../../database/entities/user.entity';
import { CreateReportInput } from './inputs/create-report.input';
import { OwnerSpaceInput } from '../../common/inputs/owner-space.input';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { UpdateReportInput } from './inputs/update-report.input';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import TwilioService from 'src/common/services/twilio.service';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { PaginationOptionsDto } from '../../common/dtos/pagination-options.dto';
import { PaginationService } from '../../common/services/pagination.service';
import { SearchOptionsDto } from '../../common/dtos/search-options.dto';
import { REPORT_KEYS } from '../../common/generics/search-keys';
import { SearchService } from '../../common/services/search.service';
import { CreateNotificationsService } from '../notifications/service/create-notification.service';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Lease)
    private leaseRepository: Repository<Lease>,
    private twilioService: TwilioService,
    private readonly mailService: MailerService,
    private configService: ConfigService,
    private PaginationService: PaginationService,
    private searchService: SearchService,
    private readonly notificationService: CreateNotificationsService,
  ) {}

  async create(user: User, body: CreateReportInput) {
    let respT;
    const admins = await this.userRepository.findOne({
      where: { role: UserRoleEnum.ADMIN },
    });

    const sendMessage = [];
    const lease = await this.leaseRepository.findOne({
      where: { id: body.leaseID },
      relations: ['property.owner'],
    });

    if (!lease) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Lease' }),
      );
    }

    const report = new Report();
    report.reporter = user;
    report.lease = lease;
    report.description = body.description;
    if (body.priority === ReportPriorityEnum.URGENT) {
      report.priority = ReportPriorityEnum.URGENT;
    } else {
      report.priority = ReportPriorityEnum.REGULAR;
    }
    report.status = ReportStatusEnum.PENDING;

    const resp = await this.reportRepository.save(report);

    sendMessage.push(report.lease.property.owner?.phone);
    sendMessage.push(admins.phone);

    for (const i of sendMessage) {
      respT = await this.twilioService.sendNotificationMessage({
        userPhone: i,
        id: resp.id.slice(-8).toUpperCase(),
        start: true,
        priority: report.priority,
      });

      await this.notificationService.create({
        message: respT.getRight().toString(),
        idUser: i.id,
        idLease: null,
        idBilling: null,
        idReport: resp.id,
        notificationType: 'Report Notification',
      });
    }
    return Either.makeRight(report);
  }

  async findAll(
    paginationOptions: PaginationOptionsDto,
    search?: SearchOptionsDto,
  ) {
    const where = this.searchService.execute(REPORT_KEYS, search);
    const reportList = await this.reportRepository.find({
      where,
      order: { createdAt: paginationOptions.order },
      relations: ['lease.property', 'reporter'],
    });
    if (!reportList) {
      return Either.makeLeft('not found');
    }
    return Either.makeRight(
      this.PaginationService.execute<Report>(reportList, paginationOptions),
    );
  }

  async findReportById(idReport: string) {
    const report = await this.reportRepository.findOne({
      where: { id: idReport },
      order: { createdAt: 'DESC' },
      relations: ['lease.property', 'reporter'],
    });
    if (!report) {
      return Either.makeLeft('not found');
    }
    return Either.makeRight(report);
  }

  async findAllTenantReport(
    user: User,
    paginationOptions: PaginationOptionsDto,
    ownerSpace?: OwnerSpaceInput,
    search?: SearchOptionsDto,
  ) {
    const whereCondition: FindOptionsWhere<Report> = {
      lease: { tenant: { id: user.id } },
    };

    if (ownerSpace?.owner_space) {
      whereCondition.lease = {
        property: { owner_space: ownerSpace.owner_space },
      };
    }
    const where = this.searchService.execute(
      REPORT_KEYS,
      search,
      whereCondition,
    );

    const list = await this.reportRepository.find({
      where,
      relations: ['lease.property', 'reporter'],
    });

    if (!list) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Reports' }),
      );
    }

    return Either.makeRight(
      this.PaginationService.execute<Report>(list, paginationOptions),
    );
  }

  async findReportByOwner(
    user: User,
    paginationOptions: PaginationOptionsDto,
    owner_space?: OwnerSpaceInput,
    search?: SearchOptionsDto,
  ) {
    const whereCondition: FindOptionsWhere<Report> = {
      lease: { property: { owner: { id: user.id } } },
    };

    if (owner_space.owner_space) {
      whereCondition.lease = {
        property: { owner_space: owner_space.owner_space },
      };
    }
    const where = this.searchService.execute(
      REPORT_KEYS,
      search,
      whereCondition,
    );
    const list = await this.reportRepository.find({
      where,
      relations: ['lease.property', 'reporter'],
      order: { createdAt: paginationOptions.order },
    });
    if (!list) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Reports' }),
      );
    }

    return Either.makeRight(
      this.PaginationService.execute<Report>(list, paginationOptions),
    );
  }

  async updateReport(user: User, body: UpdateReportInput) {
    let respT;
    const report = await this.reportRepository.findOne({
      where: { id: body.id },
      relations: [
        'reporter',
        'lease',
        'lease.property',
        'lease.property.owner',
      ],
    });
    if (!report) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Report' }),
      );
    }

    if (
      report.lease.property.owner.id !== user.id &&
      user.role !== UserRoleEnum.ADMIN
    ) {
      return Either.makeLeft(
        new EitherError('validation.something_goes_wrong'),
      );
    }

    if (body.status == 'in review') {
      report.estimated_date = new Date(body.estimatedDate);
      report.status = ReportStatusEnum.IN_REVIEW;
      report.cancelled_reason = null;
    }
    if (body.status == 'on process') {
      report.status = ReportStatusEnum.ON_PROCESS;
      report.cancelled_reason = null;
    }
    if (body.status == 'finished') {
      report.status = ReportStatusEnum.FINISHED;
      report.cancelled_reason = null;
    }
    if (body.status == 'cancel') {
      report.status = ReportStatusEnum.CANCEL;
      report.cancelled_reason = body.cancelReason;

      respT = await this.twilioService.sendNotificationMessage({
        userPhone: report.reporter.phone,
        id: report.id.slice(-8).toUpperCase(),
        reason: body.cancelReason,
      });

      await this.notificationService.create({
        message: respT.getRight().toString(),
        idUser: report.reporter.id,
        idLease: null,
        idBilling: null,
        idReport: report.id,
        notificationType: 'Cancelled Report Notification',
      });
      /*  if (report.reporter.email) {
        await this.mailService.sendMail({
          to: report.reporter.email,
          subject: `Information to ${report.reporter.firstName} Request Status Changed`,
          template: 'reports-challenge-alert',
          context: {
            message: `your request ${minId}, has been cancelled: ${body.cancelReason}`,
          },
        });
      } */
      await this.reportRepository.save(report);
      return Either.makeRight(report);
    }

    await this.reportRepository.save(report);

    respT = await this.twilioService.sendNotificationMessage({
      userPhone: report.reporter.phone,
      id: report.id.slice(-8).toUpperCase(),
    });
    await this.notificationService.create({
      message: respT.getRight().toString(),
      idUser: report.reporter.id,
      idLease: null,
      idBilling: null,
      idReport: report.id,
      notificationType: 'Changed report status notification',
    });

    /*     if (report.reporter.email) {
      await this.mailService.sendMail({
        to: report.reporter.email,
        subject: `Information to ${report.reporter.firstName} Request Status Changed`,
        template: 'reports-challenge-alert',
        context: {
          message: `your request ${minId}, has changed, check it out at: ${url}`,
        },
      });
    } */

    return Either.makeRight(report);
  }

  async alertMaintanceOver() {}
}
