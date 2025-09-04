import { Injectable } from '@nestjs/common';
import { FindOptionsWhere, Like } from 'typeorm';
import { SearchOptionsDto } from '../dtos/search-options.dto';

@Injectable()
export class SearchService {
  execute<T>(
    keys: (keyof Partial<T>)[],
    searchOptions: SearchOptionsDto,
    oldWhere: FindOptionsWhere<T> = {},
  ): FindOptionsWhere<T>[] {
    if (!searchOptions.value) return [oldWhere];
    return keys.map(
      (key) =>
        ({
          ...oldWhere,
          [key]: Like(`%${searchOptions.value}%`),
        }) as FindOptionsWhere<T>,
    );
  }
}
