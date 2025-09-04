import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Either } from 'src/common/generics/either';
import { EitherError } from 'src/common/generics/error';
import { Font } from 'src/database/entities/fonts.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FontService {
  constructor(
    @InjectRepository(Font)
    private readonly fontRepository: Repository<Font>) {}

  async findAll() {
    const fontList = await this.fontRepository.find({
      order: { name: 'DESC' },
    });

    if (!fontList) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Fonts' }),
      );
    }

    return Either.makeRight(fontList);
  }

  async findFontById(idFont: string) {
    const font = await this.fontRepository.findOne({
      where: { id: idFont },
    });

    if (!font) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Font' }),
      );
    }
    return Either.makeRight(font);
  }
}
