export class InvalidTokenType extends Error {
  constructor(message?: string) {
    super(message);

    this.name = 'InvalidTokenType';
  }
}
