import { I18nPath } from 'src/language/generated/i18n.generated';

export class EitherError extends Error {
  constructor(
    public message: I18nPath,
    public args?:
      | ({ [k: string]: unknown } | string)[]
      | { [k: string]: unknown },
  ) {
    super(message);
  }
}
