import { registerEnumType } from '@nestjs/graphql';

export enum PropertySearchFields {
  NAME = 'name',
  ADDRESS = 'address',
}

registerEnumType(PropertySearchFields, {
  name: 'PropertySearchFields',
});
