import { Either } from './either';
import { EitherError } from './error';

export interface AppServiceI<P, R> {
  execute(param: P): Promise<Either<EitherError, R>>;
}
