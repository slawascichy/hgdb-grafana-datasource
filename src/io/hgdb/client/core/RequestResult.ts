import ErrorHandler from './ErrorHandler';

export default class RequestResult {
  protected objectName: string;
  protected result: any;
  protected errorHandler: ErrorHandler;
  protected isError: boolean;

  constructor(objectName: string) {
    this.objectName = objectName;
    this.errorHandler = new ErrorHandler();
    this.isError = false;
  }

  getResult() {
    return this.result;
  }

  setResult(result: any) {
    this.result = result;
  }

  setIsError(isError: boolean) {
    this.isError = isError;
  }

  getIsError() {
    return this.isError;
  }

  getObject() {
    return null;
  }
}
