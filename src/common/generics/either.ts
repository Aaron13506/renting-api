export class Either<L, R> {
  private readonly value: L | R;

  private constructor(
    value: L | R,
    private readonly left = false,
  ) {
    this.value = value;
  }

  isLeft(): boolean {
    return this.left;
  }

  isRight(): boolean {
    return !this.isLeft();
  }

  getLeft() {
    if (!this.isLeft()) throw new Error('Call-Bad-Side');
    return <L>this.value;
  }

  getRight() {
    if (this.isLeft()) throw new Error('Call-Bad-Side');
    return <R>this.value;
  }

  static makeLeft<L, R>(value: L) {
    return new Either<L, R>(value, true);
  }

  static makeRight<L, R>(value: R) {
    return new Either<L, R>(value);
  }
}
