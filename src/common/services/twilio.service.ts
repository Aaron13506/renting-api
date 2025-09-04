import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Twilio } from 'twilio';
import { Repository } from 'typeorm';

import { I18nService } from 'nestjs-i18n';
import { NumberProperty } from 'src/database/entities/number-property.entity';
import { I18nTranslations } from 'src/language/generated/i18n.generated';
import { SendCodeMessageDto } from '../dtos/send-code-message.dto';
import { Either } from '../generics/either';
import { SendWelcomeMessageDto } from '../dtos/send-welcome-message.dto';
import { SendRawMessageDto } from '../dtos/send-raw-message.dto';
import { SendNotificationMessageDto } from '../dtos/send-notification-message.dto';
import { SendOverdueMessageDto } from '../dtos/send-overdue-message.dto';
import { SendIndividualMessageDto } from '../dtos/send-individual-message.dto';
import { SendNotificationRegisterLease } from '../dtos/send-notification-register-lease.dto';
import { SendNotificationPaymentReceiptBill } from '../dtos/send-notification-payment-receipt.dto';

@Injectable()
export default class TwilioService {
  private readonly client: Twilio;
  private readonly defaultNumber: string;

  constructor(
    @InjectRepository(NumberProperty)
    private numberRepository: Repository<NumberProperty>,
    private configService: ConfigService,
    private readonly i18n: I18nService<I18nTranslations>,
  ) {
    const accountSid = configService.get<string>('twilio.accountSid');
    const authToken = configService.get<string>('twilio.authToken');
    this.defaultNumber = configService.get<string>('twilio.defaultNumber');
    this.client = new Twilio(accountSid, authToken);
  }

  public sendCodeMessage = async (
    data: SendCodeMessageDto,
  ): Promise<Either<Error, boolean>> => {
    let number = <NumberProperty>{};
    if (data.numberPropertyFilter)
      number = await this.numberRepository.findOne({
        where: data.numberPropertyFilter,
      });
    const messageResponse = await this.client.messages.create({
      shortenUrls: true,
      body: this.i18n.t('twilio.send_message_code', {
        args: {
          appName: this.configService.get<string>('server.appName'),
          code: data.code,
        },
      }),
      from: '+' + (number.phone || this.defaultNumber),
      to: '+' + data.userPhone,
    });
    if (messageResponse.errorCode) {
      return Either.makeLeft(new Error(messageResponse.errorMessage));
    }
    return Either.makeRight(true);
  };

  public getClient = () => this.client;

  public sendWelcomeMessage = async (
    data: SendWelcomeMessageDto,
  ): Promise<Either<Error, boolean>> => {
    let number = <NumberProperty>{};
    if (data.numberPropertyFilter)
      number = await this.numberRepository.findOne({
        where: data.numberPropertyFilter,
      });
    const link = this.configService.get<string>('server.frontUrl');

    const welcomeMessageResponse = await this.client.messages.create({
      shortenUrls: true,
      body: this.i18n.t('twilio.send_welcome_message', {
        args: {
          appName: this.configService.get<string>('server.appName'),
          message: `${link}`,
        },
      }),
      from: '+' + (number.phone || this.defaultNumber),
      to: '+' + data.userPhone,
    });
    if (!welcomeMessageResponse) {
      return Either.makeLeft(new Error(welcomeMessageResponse.errorMessage));
    }
    return Either.makeRight(true);
  };

  public SendRawMessage = async (
    data: SendRawMessageDto,
  ): Promise<Either<Error, boolean>> => {
    let number = <NumberProperty>{};
    if (data.numberPropertyFilter)
      number = await this.numberRepository.findOne({
        where: data.numberPropertyFilter,
      });

    const rawMessageResponse = await this.client.messages.create({
      shortenUrls: true,
      body: this.i18n.t('twilio.send_raw_message', {
        args: {
          appName: data.property,
          message: data.message,
        },
      }),
      from: '+' + (number.phone || this.defaultNumber),
      to: '+' + data.numbers,
    });

    if (!rawMessageResponse) {
      return Either.makeLeft(new Error(rawMessageResponse.errorMessage));
    }
    return Either.makeRight(true);
  };

  public sendIndividualMessageToUser = async (
    data: SendIndividualMessageDto,
  ): Promise<Either<Error, boolean>> => {
    let number = <NumberProperty>{};
    if (data.numberPropertyFilter)
      number = await this.numberRepository.findOne({
        where: data.numberPropertyFilter,
      });
    if (data.isAdmin) {
      const individualMessageResponse = await this.client.messages.create({
        shortenUrls: true,
        body: this.i18n.t('twilio.send_individual_message_from_Admin', {
          args: {
            appName: this.configService.get<string>('server.appName'),
            message: data.message,
          },
        }),
        from: '+' + (number.phone || this.defaultNumber),
        to: '+' + data.numberTo,
      });
      if (!individualMessageResponse) {
        return Either.makeLeft(
          new Error(individualMessageResponse.errorMessage),
        );
      }
      return Either.makeRight(true);
    } else {
      const individualMessageResponse = await this.client.messages.create({
        shortenUrls: true,
        body: this.i18n.t('twilio.send_individual_message', {
          args: {
            appName: this.configService.get<string>('server.appName'),
            message: data.message,
            property: data.propertyName,
          },
        }),
        from: '+' + (number.phone || this.defaultNumber),
        to: '+' + data.numberTo,
      });
      if (!individualMessageResponse) {
        return Either.makeLeft(
          new Error(individualMessageResponse.errorMessage),
        );
      }
      return Either.makeRight(true);
    }
  };

  public sendNotificationMessage = async (data: SendNotificationMessageDto) => {
    let number = <NumberProperty>{};
    if (data.numberPropertyFilter)
      number = await this.numberRepository.findOne({
        where: data.numberPropertyFilter,
      });
    const link = this.configService.get<string>('server.frontUrl');

    if (data.start) {
      const notificationMessageResponse = await this.client.messages.create({
        shortenUrls: true,
        body: this.i18n.t('twilio.send_notification_message_start_report', {
          args: {
            appName: this.configService.get<string>('server.appName'),
            message: `${link}`,
            id: data.id,
            priority: `${data.priority}`,
          },
        }),
        from: '+' + (number.phone || this.defaultNumber),
        to: '+' + data.userPhone,
      });
      if (!notificationMessageResponse) {
        return Either.makeLeft(
          new Error(notificationMessageResponse.errorMessage),
        );
      }
      return Either.makeRight(notificationMessageResponse.body);

    } else if (data.reason) {
      const notificationMessageResponse = await this.client.messages.create({
        shortenUrls: true,
        body: this.i18n.t('twilio.send_notification_cancel_message', {
          args: {
            appName: this.configService.get<string>('server.appName'),
            message: `${data.id} ${data.reason}`,
            id: data.id,
            reason: data.reason,
          },
        }),
        from: '+' + (number.phone || this.defaultNumber),
        to: '+' + data.userPhone,
      });

      if (!notificationMessageResponse) {
        return Either.makeLeft(
          new Error(notificationMessageResponse.errorMessage),
        );
      }
      return Either.makeRight(notificationMessageResponse.body);
    } else {
      const notificationMessageResponse = await this.client.messages.create({
        shortenUrls: true,
        body: this.i18n.t('twilio.send_notification_message', {
          args: {
            appName: this.configService.get<string>('server.appName'),
            message: `${link}`,
            id: data.id,
          },
        }),
        from: '+' + (number.phone || this.defaultNumber),
        to: '+' + data.userPhone,
      });

      if (!notificationMessageResponse) {
        return Either.makeLeft(
          new Error(notificationMessageResponse.errorMessage),
        );
      }
      return Either.makeRight(notificationMessageResponse.body);
    }
  };

  public sendOverdueMessage = async (data: SendOverdueMessageDto) => {
    let number = <NumberProperty>{};
    if (data.numberPropertyFilter)
      number = await this.numberRepository.findOne({
        where: data.numberPropertyFilter,
      });
    const messageResponse = await this.client.messages.create({
      shortenUrls: true,
      body: this.i18n.t('twilio.send_overdue_message', {
        args: {
          appName: this.configService.get<string>('server.appName'),
          code: data.leaseCode,
          name: data.propertyName,
          amount: data.amount,
          date: data.date,
        },
      }),
      from: '+' + (number.phone || this.defaultNumber),
      to: '+' + data.userPhone,
    });
    if (messageResponse.errorCode) {
      return Either.makeLeft(new Error(messageResponse.errorMessage));
    }
    return Either.makeRight(messageResponse.body);
  };

  public sendNotificationReportStatusPendingMessage = async (
    data: SendNotificationMessageDto,
  ) => {
    let number = <NumberProperty>{};
    if (data.numberPropertyFilter)
      number = await this.numberRepository.findOne({
        where: data.numberPropertyFilter,
      });
    const link = this.configService.get<string>('server.frontUrl');
    if (data.reason) {
      const notificationMessageResponse = await this.client.messages.create({
        shortenUrls: true,
        body: this.i18n.t('twilio.send_notification_report_overdue_message', {
          args: {
            appName: this.configService.get<string>('server.appName'),
            message: `${link}`,
            id: data.id,
            reason: data.reason,
          },
        }),
        from: '+' + (number.phone || this.defaultNumber),
        to: '+' + data.userPhone,
      });
      if (!notificationMessageResponse) {
        return Either.makeLeft(
          new Error(notificationMessageResponse.errorMessage),
        );
      }
      return Either.makeRight(notificationMessageResponse.body);
    }
    const notificationMessageResponse = await this.client.messages.create({
      shortenUrls: true,
      body: this.i18n.t('twilio.send_notification_report_pending_message', {
        args: {
          appName: this.configService.get<string>('server.appName'),
          message: `${link}`,
          id: data.id,
        },
      }),
      from: '+' + (number.phone || this.defaultNumber),
      to: '+' + data.userPhone,
    });
    if (!notificationMessageResponse) {
      return Either.makeLeft(
        new Error(notificationMessageResponse.errorMessage),
      );
    }
    return Either.makeRight(notificationMessageResponse.body);
  };

  public sendRegisterLeaseNotification = async (
    data: SendNotificationRegisterLease,
  ) => {
    let number = <NumberProperty>{};
    if (data.numberPropertyFilter)
      number = await this.numberRepository.findOne({
        where: data.numberPropertyFilter,
      });
    const link = this.configService.get<string>('server.frontUrl');
    if (data.sendTo === 'tenant') {
      const notificationMessageResponse = await this.client.messages.create({
        shortenUrls: true,
        body: this.i18n.t('twilio.send_notification_new_lease_message', {
          args: {
            appName: this.configService.get<string>('server.appName'),
            message: `${link}`,
            property: data.propertyName,
            leaseCode: data.leaseCode,
          },
        }),
        from: '+' + (number.phone || this.defaultNumber),
        to: '+' + data.userPhone,
      });
      if (!notificationMessageResponse) {
        return Either.makeLeft(
          new Error(notificationMessageResponse.errorMessage),
        );
      }

      return Either.makeRight(notificationMessageResponse.body);
    }

    const notificationMessageResponse = await this.client.messages.create({
      shortenUrls: true,
      body: this.i18n.t(
        'twilio.send_notification_document_lease_signed_message',
        {
          args: {
            appName: this.configService.get<string>('server.appName'),
            message: `${link}`,
            property: data.propertyName,
            leaseCode: data.leaseCode,
          },
        },
      ),
      from: '+' + (number.phone || this.defaultNumber),
      to: '+' + data.userPhone,
    });
    if (!notificationMessageResponse) {
      return Either.makeLeft(
        new Error(notificationMessageResponse.errorMessage),
      );
    }

    return Either.makeRight(notificationMessageResponse.body);
  };

  public sendPaymentReceiptNotification = async (
    data: SendNotificationPaymentReceiptBill,
  ) => {
    let number = <NumberProperty>{};
    if (data.numberPropertyFilter)
      number = await this.numberRepository.findOne({
        where: data.numberPropertyFilter,
      });
    const link = this.configService.get<string>('server.frontUrl');
    if (data.sendTo === 'tenant') {
      const notificationMessageResponse = await this.client.messages.create({
        shortenUrls: true,
        body: this.i18n.t(
          'twilio.send_notification_new_payment_status_message',
          {
            args: {
              appName: this.configService.get<string>('server.appName'),
              message: `${link}`,
              property: data.propertyName,
              leaseCode: data.leaseCode,
              idBill: data.idBill,
            },
          },
        ),
        from: '+' + (number.phone || this.defaultNumber),
        to: '+' + data.userPhone,
      });
      if (!notificationMessageResponse) {
        return Either.makeLeft(
          new Error(notificationMessageResponse.errorMessage),
        );
      }
      return Either.makeRight(notificationMessageResponse.body);
    }

    const notificationMessageResponse = await this.client.messages.create({
      shortenUrls: true,
      body: this.i18n.t(
        'twilio.send_notification_new_payment_receipt_message',
        {
          args: {
            appName: this.configService.get<string>('server.appName'),
            message: `${link}`,
            property: data.propertyName,
            leaseCode: data.leaseCode,
            idBill: data.idBill,
          },
        },
      ),
      from: '+' + (number.phone || this.defaultNumber),
      to: '+' + data.userPhone,
    });
    if (!notificationMessageResponse) {
      return Either.makeLeft(
        new Error(notificationMessageResponse.errorMessage),
      );
    }
    return Either.makeRight(notificationMessageResponse.body);
  };
}
