import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TermCondition} from 'src/database/entities/terms-conditions.entity';
import { Repository } from 'typeorm';
import { CreateTermConditionInput } from './inputs/terms-conditions.input';
import { Either } from 'src/common/generics/either';
import { EitherError } from 'src/common/generics/error';

@Injectable()
export class TermsConditionsService {
  constructor(
    @InjectRepository(TermCondition)
    private readonly termsConditionsRepository: Repository<TermCondition>,
  ) {}

  async createTerm(body: CreateTermConditionInput) {
    const termCondition = new TermCondition();
    termCondition.name = body.name;
    termCondition.document = body.document;
    return Either.makeRight(
      await this.termsConditionsRepository.save(termCondition),
    );
  }
  async findTerms(idTerms: string) {
    const terms = await this.termsConditionsRepository.findOne({
      where: { id: idTerms },
    });
    if (!terms) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Terms' }),
      );
    }

    return Either.makeRight(terms);
  }

  async editTermsCondition(idTerms: string) {

    const terms = await this.termsConditionsRepository.findOne({
      where: { id: idTerms },
    });

    if (!terms) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Terms' }),
      );
    }

    return Either.makeRight(terms);
  }

  async deleteTermsCondition() {}
}
