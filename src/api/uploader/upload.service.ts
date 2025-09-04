import { Injectable } from '@nestjs/common';
import AWSService from 'src/common/services/aws.service';
import { UploadInput } from './inputs/upload.input';
import { EitherError } from 'src/common/generics/error';
import { Either } from 'src/common/generics/either';
import { MineTypes } from 'src/common/enums/mine-types.enum';

@Injectable()
export class UploaderService {
  constructor(private awsService: AWSService) {}

  async uploadFile(body: UploadInput) {
    const base = body.base;
    const type = body.type;

    const buffer = Buffer.from(base, 'base64');

    if (!MineTypes[type]) {
      return Either.makeLeft(
        new EitherError('validation.something_goes_wrong'),
      );
    }

    const name = Date.now();
    const url = await this.awsService.upload(
      body.location.replace('',''),
      name + body.name + '-' + MineTypes[type],
      buffer,
      type
    )
    return Either.makeRight(url);
  }
}
