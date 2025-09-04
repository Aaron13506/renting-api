import { NumberProperty } from 'src/database/entities/number-property.entity';
import { User } from 'src/database/entities/user.entity';
import { FindOptionsWhere } from 'typeorm';

export class SendCodeMessageDto {
  numberPropertyFilter?: FindOptionsWhere<NumberProperty>;
  code: string;
  userPhone: User['phone'];
}
