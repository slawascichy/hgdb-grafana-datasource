import $ from 'jquery';
import { WRONG_VALUE } from './Constants';
import ErrorHandler from './ErrorHandler';

export default class AjaxMethods {
  private objectName: string;
  private errorHandler: ErrorHandler;

  constructor() {
    this.objectName = 'AjaxMethods';
    this.errorHandler = new ErrorHandler();
  }

  /**
   * Metoda odpowiedzialna za wyświetlenie JSON`a zapisanego w postaci
   * String'a w postaci obiektu
   *
   * @param stringData dane wysyłane w postaci String'a
   */
  parse2JSON(stringData: string) {
    const methodName = this.objectName + '.parse2JSON';
    var result = stringData;
    try {
      result = JSON.parse(stringData);
    } catch (err) {
      this.errorHandler.logException(
        /* methodName */ methodName,
        /* message */ WRONG_VALUE + ':' + stringData,
        /* status */ 'parse2JSON_error',
        /* exception */ err
      );
    } finally {
      return result;
    }
  }

  requestWithBody(method: string, serviceUrl: string, jsonBody, isCache: boolean, token: string) {
    const methodName = this.objectName + '.requestWithBody';

    if (token === null) {
      return $.ajax({
        url: serviceUrl,
        contentType: 'application/json',
        type: method,
        dataType: 'JSON',
        data: JSON.stringify(jsonBody),
        cache: isCache,
        async: false,
      });
    } else {
      return $.ajax({
        headers: {
          Authorization: token,
        },
        url: serviceUrl,
        contentType: 'application/json',
        type: method,
        dataType: 'JSON',
        data: JSON.stringify(jsonBody),
        cache: isCache,
        async: false,
      });
    }
  }

  requestWithParams(method: string, serviceUrl: string, jsonParams, isCache: boolean, token: string) {
    const methodName = this.objectName + '.requestWithParams';

    if (token === null) {
      return $.ajax({
        headers: {
          Authorization: token,
        },
        url: serviceUrl,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        type: method,
        data: $.param(jsonParams),
        cache: isCache,
        async: false,
      });
    } else {
      return $.ajax({
        url: serviceUrl,
        contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
        type: method,
        data: $.param(jsonParams),
        cache: isCache,
        async: false,
      });
    }
  }

  /**
   * Wysyłanie żądania Ajax - POST
   *
   * @param serviceUrl adres, pod który wysyłane są dane
   * @param jsonBody dane wysyłane metodą POST w postaci JSON
   * @param isCache czy ma być użyta pamięć podręczna? [true/false]
   * @param token token autoryzacyjny
   */
  requestByPost(
    serviceUrl: string,
    jsonBody,
    isCache: boolean,
    token: string
  ) {
    const methodName = this.objectName + '.requestByPost';
    return this.requestWithBody('POST', serviceUrl, jsonBody, isCache, token);
  }

  /**
   * Wysyłanie żądania Ajax - GET
   *
   * @param serviceUrl adres, pod który wysyłane są dane
   * @param jsonParams dane wysyłane metodą POST w postaci JSON
   * @param isCache czy ma być użyta pamięć podręczna? [true/false]
   * @param token token autoryzacyjny
   */
  requestByGet(
    serviceUrl: string,
    jsonParams,
    isCache:boolean,
    token: string
  ) {
    const methodName = this.objectName + '.requestByGet';
    return this.requestWithParams('GET', serviceUrl, jsonParams, isCache, token);
  }
}
