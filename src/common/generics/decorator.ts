import { AppServiceI } from './app-service.interface';
import { Either } from './either';
import { EitherError } from './error';

export abstract class Decorator<P, E> implements AppServiceI<P, E> {
  private service: AppServiceI<P, E>;

  constructor(service: AppServiceI<P, E>) {
    this.service = service;
  }

  async execute(data: P): Promise<Either<EitherError, E>> {
    return this.service.execute(data);
  }
}
