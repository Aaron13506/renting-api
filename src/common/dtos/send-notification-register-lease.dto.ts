import { NumberProperty } from 'src/database/entities/number-property.entity';
import { FindOptionsWhere } from 'typeorm';

export class SendNotificationRegisterLease {
  numberPropertyFilter?: FindOptionsWhere<NumberProperty>;
  userPhone?: string;
  propertyName: string;
  sendTo?: string;
  leaseCode: string;
}
