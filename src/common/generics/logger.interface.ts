import { Either } from './either';

export interface LoggerI<T, E> {
  execute(action: string, result: T): Promise<Either<T, E>>;
}
