import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { GraphQLError } from 'graphql';
import { I18nContext } from 'nestjs-i18n';
import { map, Observable } from 'rxjs';

import { Either } from '../generics/either';
import { EitherError } from '../generics/error';

export class EitherResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((data: Either<EitherError, unknown>) => {
        if (data.isLeft()) {
          const i18n = I18nContext.current();
          const error = data.getLeft();
          return new GraphQLError(i18n.t(error.message, { args: error.args }));
        }
        return data.getRight();
      }),
    );
  }
}
