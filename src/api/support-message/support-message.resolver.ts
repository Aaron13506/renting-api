import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { SupportMessage } from 'src/database/entities/support-message.entity';
import { CreateSupportMessageInput } from './inputs/create-support-message';
import { SupportMessageService } from './support-message.service';
import { PubSub } from 'graphql-subscriptions';
import { User } from 'src/database/entities/user.entity';
import { UserD } from 'src/common/decorators/user.decorator';
import { AuthRequest } from 'src/common/decorators/auth-request';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportChat } from '../../database/entities/support-chat.entity';

const pubSub = new PubSub();

@Resolver(() => SupportMessage)
export class SupportMessageResolver {
  constructor(
    private readonly supportMessageService: SupportMessageService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  @Subscription(() => SupportMessage, {
    name: 'newMessage',
    filter: function (
      payload: { newMessage: SupportMessage },
      variables: { userId: string },
    ) {
      return this?.supportMessageService?.canReceiveMessage(
        payload.newMessage,
        variables,
      );
    },
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  subscribeToNewMessage(@Args('userId') userId: string) {
    return pubSub.asyncIterator('newMessage');
  }

  @Mutation(() => SupportMessage)
  @AuthRequest()
  async createSupportMessage(
    @UserD() user: User,
    @Args('createSupportMessageInput') body: CreateSupportMessageInput,
  ) {
    const newMessage = await this.supportMessageService.createSupportMessage(
      user,
      body,
    );
    if (newMessage.isLeft()) {
      throw newMessage.getLeft();
    }
    await pubSub.publish('newMessage', { newMessage: newMessage.getRight() });
    return newMessage;
  }

  @Query(() => [SupportMessage])
  @AuthRequest()
  async findMessages(@Args('chat') chat: string) {
    return await this.supportMessageService.findMessages(chat);
  }

  @Query(() => [SupportChat])
  @AuthRequest()
  async findChats(@UserD() user: User) {
    return await this.supportMessageService.findChats(user);
  }
}
