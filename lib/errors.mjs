export class ErrorWithExtraData extends Error {
  constructor(message, extraData = null) {
    super(message);
    this.name = this.constructor.name;
    this.extraData = extraData;
  }
}
