import { NumberProperty } from 'src/database/entities/number-property.entity';
import { FindOptionsWhere } from 'typeorm';

export class SendRawMessageDto {
  numberPropertyFilter?: FindOptionsWhere<NumberProperty>;
  message: string;
  numbers: string
  property: string
}
