import {ErrorWithExtraData} from '../errors.mjs';

export class MalformedRangeObjectError extends ErrorWithExtraData {
  constructor(extraData) {
    super('', extraData);
    this.name = this.constructor.name;
  }
}
