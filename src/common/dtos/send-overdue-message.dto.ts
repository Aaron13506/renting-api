import { FindOptionsWhere } from 'typeorm';
import { NumberProperty } from '../../database/entities/number-property.entity';
import { User } from '../../database/entities/user.entity';

export class SendOverdueMessageDto {
  numberPropertyFilter?: FindOptionsWhere<NumberProperty>;
  leaseCode: string;
  propertyName: string;
  amount: number;
  date: string;
  userPhone: User['phone'];
}