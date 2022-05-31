import RequestResult from '../core/RequestResult';

export default class EchoRequestResult extends RequestResult {

  constructor() {
    super("EchoRequestResult");
  }

  getObject() {
    return this.result;
  }

}