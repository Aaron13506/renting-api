import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Property } from 'src/database/entities/property.entity';
import { PropertyService } from './property.service';
import { CreatePropertyInput } from './inputs/register-property.input';
import { AuthRequest } from 'src/common/decorators/auth-request';
import { UserRoleEnum } from 'src/common/enums/user-role.enum';
import { User } from 'src/database/entities/user.entity';
import { UserD } from 'src/common/decorators/user.decorator';
import { InformationInput } from './inputs/send-information.inputs';
import { UpdatePropertyInput } from './inputs/update-property.input';
import { PaginationOptionsDto } from '../../common/dtos/pagination-options.dto';
import { PropertyOutput } from './outputs/property.output';
import { SearchOptionsDto } from '../../common/dtos/search-options.dto';
import { IndividualInformationInput } from './inputs/send-individual-information';

@Resolver(() => Property)
export class PropertyResolver {
  constructor(private readonly propertyService: PropertyService) {}

  @Query(() => PropertyOutput, { name: 'getProperties' })
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN],
  })
  findAll(
    @Args('paginationOptions') paginationOptionsDto: PaginationOptionsDto,
    @Args('search', { nullable: true }) search?: SearchOptionsDto,
  ) {
    return this.propertyService.findAll(paginationOptionsDto, search);
  }

  @Query(() => Property!, { name: 'getProperty' })
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN],
  })
  findOne(@Args('id') id: string) {
    return this.propertyService.findOne(id);
  }

  @Query(() => PropertyOutput, { name: 'getPropertiesByOwner' })
  @AuthRequest()
  findByOwner(
    @UserD() user: User,
    @Args('paginationOptions') paginationOptions: PaginationOptionsDto,
    @Args('search', { nullable: true }) search?: SearchOptionsDto,
  ) {
    return this.propertyService.findByOwner(user, paginationOptions, search);
  }

  @Mutation(() => Property)
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER],
  })
  registerProperty(
    @Args('registerPropertyInput') body: CreatePropertyInput,
    @UserD() user: User,
  ) {
    return this.propertyService.registerProperty(body, user);
  }

  @Mutation(() => String)
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER],
  })
  sendInformationToPropertyUsers(
    @Args('SendInformationToProperty') body: InformationInput,
  ) {
    return this.propertyService.sendInformationToProperty(body);
  }

  @Mutation(() => String)
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER],
  })
  sendInformationToIndividualPropertyUser(
    @Args('SendInformationToUser') body: IndividualInformationInput,
    @UserD() user: User,
  ) {
    return this.propertyService.sendSmsToUserFromProperty(body, user);
  }

  @Mutation(() => Property)
  @AuthRequest({
    roles: [UserRoleEnum.ADMIN, UserRoleEnum.OWNER],
  })
  updateProperty(
    @Args('UpdateProperty') updateFields: UpdatePropertyInput,
    @UserD() user: User,
  ) {
    return this.propertyService.updateProperty(updateFields, user);
  }
}
