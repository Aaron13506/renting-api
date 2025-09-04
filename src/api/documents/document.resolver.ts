import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthRequest } from 'src/common/decorators/auth-request';
import { UserD } from 'src/common/decorators/user.decorator';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { Document } from 'src/database/entities/document.entity';
import { User } from 'src/database/entities/user.entity';
import { DocumentService } from './document.service';
import { UpdateDocumentInput } from './dto/updateDocument-input';
import { VersionDocumentService } from './versionDocuments/versionDocument.service';
import { SigneDocumentInput } from './dto/signedDocument-input';

@Resolver(() => Document)
export class DocumentResolver {
  constructor(
    private readonly documentService: DocumentService,
    private readonly documentVersionService: VersionDocumentService,
  ) {}

  @Query(() => [Document!], { name: 'AllDocuments' })
  @AuthRequest({ roles: [UserRoleEnum.ADMIN] })
  findAll() {
    return this.documentService.findAll();
  }

  @Query(() => Document, { name: 'DocumentById' })
  @AuthRequest({ roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER] })
  findByid(@Args('findDocumentById') idDocument: string, @UserD() user: User) {
    return this.documentService.findOneById(idDocument, user);
  }

  @Query(() => [Document!], { name: 'DocumentsByOwner' })
  @AuthRequest({ roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER] })
  findByOwner(@UserD() user: User) {
    return this.documentService.findDocumentsByOwner(user);
  }

  @Mutation(() => Document)
  @AuthRequest({ roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER] })
  updateDocument(
    @Args('updateDocumentById') updateFields: UpdateDocumentInput,
    @UserD() user: User,
  ) {
    return this.documentService.updateDocument(updateFields, user);
  }

  @Mutation(() => Document)
  @AuthRequest()
  signedDocument(
    @Args('signedDocument') body: SigneDocumentInput,
    @UserD() user: User,
  ) {
    return this.documentVersionService.signedDocument(user, body);
  }

  @Mutation(() => Document)
  @AuthRequest({ roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER] })
  deleteDocument(
    @Args('deleteDocument') idDocument: string,
    @UserD() user: User,
  ) {
    return this.documentService.deleteDocument(idDocument, user);
  }
}

