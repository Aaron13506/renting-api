import { Injectable } from '@nestjs/common';
import { PaginationOptionsDto } from '../dtos/pagination-options.dto';

@Injectable()
export class PaginationService {
  async execute<T>(items: T[], paginationOptions: PaginationOptionsDto) {
    if (!paginationOptions.isPaginated) {
      return {
        items,
        page: 1,
        count: items.length,
        next: false,
      };
    }
    const { skip, take } = paginationOptions;
    const paginatedItems = items.slice(skip, skip + take);
    const count = items.length;
    const next = paginationOptions.page < Math.ceil(count / take);
    return {
      items: paginatedItems,
      page: paginationOptions.page,
      count,
      next,
    };
  }
}
