import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SupportMessage } from 'src/database/entities/support-message.entity';
import { Repository } from 'typeorm';
import { CreateSupportMessageInput } from './inputs/create-support-message';
import { User } from '../../database/entities/user.entity';
import { SupportChat } from '../../database/entities/support-chat.entity';
import { Either } from '../../common/generics/either';
import { EitherError } from '../../common/generics/error';
import { UserRoleEnum } from '../../common/enums/user-role.enum';

@Injectable()
export class SupportMessageService {
  constructor(
    @InjectRepository(SupportMessage)
    private readonly supportMessageRepository: Repository<SupportMessage>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SupportChat)
    private readonly supportChatRepository: Repository<SupportChat>,
  ) {
  }

  async canReceiveMessage(
    payload: SupportMessage,
    variables: { userId: string },
  ) {
    const user = await this.userRepository.findOne({
      where: { id: variables.userId },
    });
    return (
      user.role === UserRoleEnum.ADMIN ||
      user.id === payload.chat?.creator?.id ||
      false
    );
  }

  async findMessages(chat: string) {
    const chatExists = await this.supportChatRepository.findOne({ where: { id: chat } });
    if (!chatExists) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Chat' }),
      );
    }
    return Either.makeRight(
      await this.supportMessageRepository.find({
        where: { chat: { id: chat } },
        relations: ['user', 'chat'],
        order: { createdAt: 'ASC' },
      }),
    );
  }

  async findChats(user: User) {
    let where = {};
    if (user.role !== UserRoleEnum.ADMIN) {
      where = { creator: { id: user.id } };
    }
    return Either.makeRight(this.supportChatRepository.find({
      where,
      relations: ['creator', 'messages.user'],
      order: { messages: { createdAt: 'DESC' } },
    }));
  }

  async createSupportMessage(
    user: User,
    body: CreateSupportMessageInput,
  ): Promise<Either<EitherError, SupportMessage>> {
    let where = {};

    if (user.role === UserRoleEnum.ADMIN && !body.chatId) {
      return Either.makeLeft(
        new EitherError('validation.entity_not_found', { entity: 'Chat' }),
      );
    }

    if (user.role !== UserRoleEnum.ADMIN) {
      where = { creator: { id: user.id } };
    } else {
      where = { id: body.chatId };
    }

    let chat = await this.supportChatRepository.findOne({
      where,
      relations: ['creator', 'messages.user'],
    });

    if (!chat) {
      if (user.role === UserRoleEnum.ADMIN) {
        return Either.makeLeft(
          new EitherError('validation.entity_not_found', { entity: 'Chat' }),
        );
      }
      chat = new SupportChat();
      chat.creator = user;
      chat.createdAt = new Date();
      chat.updatedAt = new Date();
      await this.supportChatRepository.save(chat);
    } else {
      chat.updatedAt = new Date();
      await this.supportChatRepository.save(chat);
    }

    const message = new SupportMessage();
    message.user = user;
    message.message = body.message;
    message.chat = chat;
    message.url = body.url;

    await this.supportMessageRepository.save(message);
    return Either.makeRight(message);
  }
}
