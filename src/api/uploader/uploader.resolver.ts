import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { UploaderService } from './upload.service';
import { BasicRequest } from 'src/common/decorators/basic-request';
import { UploadInput } from './inputs/upload.input';

@Resolver(() => String)
export class UploaderResolver {
  constructor(private readonly uploadService: UploaderService) {}

  @Mutation(() => String!, { name: 'uploader' })
  @BasicRequest()
  uploadFile(@Args('imageInput') body: UploadInput) {
    return this.uploadService.uploadFile(body);
  }
}
