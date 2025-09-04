import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Either } from '../generics/either';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export default class AWSService {
  private _s3: S3Client;
  private _bucket: string;

  constructor(private configService: ConfigService) {
    this._s3 = new S3Client({ region: 'us-east-1' });
    this._bucket = this.configService.get('aws.bucket');
    this._bucket = process.env.AWS_BUCKET;
  }

  public async upload(
    folder: string,
    name: string,
    data: Buffer,
    mineType?: string,
  ) {
    try {
      const buffer = data;
      const key = folder + '/' + name;
      const resp = await this._s3.send(
        new PutObjectCommand({
          ContentType: mineType,
          Bucket: this._bucket,
          Key: key,
          Body: buffer,
        }),
      );
      if (resp) {
        return key;
      }
    } catch (error) {
      Logger.error(error);
      return Either.makeLeft(
        new HttpException('BAD_REQUEST: AWS Fail', HttpStatus.BAD_REQUEST),
      );
    }
  }
}
