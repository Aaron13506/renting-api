import { Field, InputType } from '@nestjs/graphql';
import { OrderEnum } from '../enums/pagination-order.enum';

@InputType()
export class PaginationOptionsDto {
  @Field(() => Boolean, { defaultValue: true })
  readonly isPaginated?: boolean = true;

  @Field(() => OrderEnum, { defaultValue: OrderEnum.ASC })
  readonly order?: OrderEnum = OrderEnum.ASC;

  @Field(() => Number, { defaultValue: 1 })
  readonly page?: number = 1;

  @Field(() => Number, { defaultValue: 10 })
  readonly take?: number = 10;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
