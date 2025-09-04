import { NumberProperty } from "src/database/entities/number-property.entity";
import { FindOptionsWhere } from "typeorm";

export class SendIndividualMessageDto {
  numberPropertyFilter?: FindOptionsWhere<NumberProperty>;
  message: string;
  numberTo: string;
  userFrom?: string;
  propertyName?: string;
  isAdmin: boolean;
}
