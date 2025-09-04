import { NumberProperty } from 'src/database/entities/number-property.entity';
import { User } from 'src/database/entities/user.entity';
import { FindOptionsWhere } from 'typeorm';

export class SendWelcomeMessageDto {
  numberPropertyFilter?: FindOptionsWhere<NumberProperty>;
  userPhone: User['phone'];
}
