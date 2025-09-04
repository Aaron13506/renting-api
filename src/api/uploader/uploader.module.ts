import { Module } from '@nestjs/common';
import { UploaderService } from './upload.service';
import { UploaderResolver } from './uploader.resolver';
import AWSService from 'src/common/services/aws.service';

@Module({
  providers: [UploaderService, UploaderResolver, AWSService],
})
export class UploaderModule {}
