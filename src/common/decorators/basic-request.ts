import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { EitherResponseInterceptor } from '../interceptor/either-response.interceptor';
import { LoggerInterceptor } from '../interceptor/logger.interceptor';

export function BasicRequest() {
  return applyDecorators(
    UseInterceptors(LoggerInterceptor),
    UseInterceptors(EitherResponseInterceptor),
  );
}
