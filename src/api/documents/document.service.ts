import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { Either } from 'src/common/generics/either';
import { EitherError } from 'src/common/generics/error';
import { Document } from 'src/database/entities/document.entity';
import { User } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateDocumentInput } from './dto/updateDocument-input';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  async findAll() {
    const documents = await this.documentRepository.find({
      where: {},
      relations: ['lease', 'uploadedBy', 'version', 'lease.property'],
    });
    if (!documents) {
      return Either.makeRight([]);
    }

    return Either.makeRight(documents);
  }

  async findOneById(idDocument: string, user: User) {
    const document = await this.documentRepository.findOne({
      where: { id: idDocument },
      relations: ['lease', 'uploadedBy', 'version', 'lease.property', 'lease.tenant'],
    });
    if (!document) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Document' }),
      );
    }

    if (document.uploadedBy.id != user.id) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Document' }),
      );
    }

    return Either.makeRight(document);
  }

  async findDocumentsByOwner(user: User) {
    const documents = await this.documentRepository.find({
      where: { uploadedBy: { id: user.id } },
      relations: ['lease', 'uploadedBy', 'version', 'lease.property'],
    });
    if (!documents) {
      return Either.makeRight([]);
    }

    return Either.makeRight(documents);
  }

  async updateDocument(updateFields: UpdateDocumentInput, user: User) {
    const document = await this.documentRepository.findOne({
      where: { id: updateFields.documentId },
      relations: ['lease', 'uploadedBy', 'version', 'lease.property'],
    });

    if (!document) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Document' }),
      );
    }

    if (document.uploadedBy.id != user.id && user.role != UserRoleEnum.ADMIN) {
      return Either.makeLeft(
        new EitherError('validation.you_cannot_do_this_action'),
      );
    }

    document.name = updateFields.documentName;
    document.contentUrl = updateFields.documentUrl;
    document.createdAt = new Date();

    await this.documentRepository.save(document);

    return Either.makeRight(document);
  }

  async deleteDocument(idDocument: string, user: User) {
    const document = await this.documentRepository.findOne({
      where: { id: idDocument },
      relations: ['lease', 'uploadedBy', 'version'],
    });

    if (!document) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Document' }),
      );
    }

    if (document.uploadedBy.id != user.id && user.role != UserRoleEnum.ADMIN) {
      return Either.makeLeft(
        new EitherError('validation.you_cannot_do_this_action'),
      );
    }
    await this.documentRepository.remove(document);
    return Either.makeRight('the document was successfully deleted');
  }
}
