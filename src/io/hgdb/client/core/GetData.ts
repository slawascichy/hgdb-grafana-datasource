import AjaxMethods from './AjaxMethods';
import ErrorHandler from './ErrorHandler';
import ConnectionDefinition from './ConnectionDefinition';
import RequestResult from './RequestResult';
import OAuthToken from './OAuthToken';
import {
  OAUTH_AUTHENTCIATION_ERROR,
  REQUEST_COLLECTOR_IS_EMPTY_ERROR,
  CANT_GET_TOKEN,
  CANT_FIND_REQUEST_METHOD,
  LOAD_DATA_ERROR,
  WRONG_REQUEST,
  EMPTY_REQUEST,
  NO_PAGE_SIZE,
  NO_PAGE_NUMBER,
  OTHER_ERROR,
  ERROR_IN_REQUEST,
} from './Constants';

export default class GetData {
  objectName: string;
  accessByAjax: AjaxMethods;
  errorHandler: ErrorHandler;
  connectionDefinition: ConnectionDefinition;

  /**
   * Przykład konfiguracji:
   *
   * <code>
  var configuration = {
    serverUrl: instanceSettings.jsonData.serverUrl,
    securityUrl: {
      tokenUrl: instanceSettings.jsonData.accesTokenURI,
      params: {
        grant_type: 'password',
        username: instanceSettings.jsonData.username,
        password: instanceSettings.jsonData.password,
        client_id: instanceSettings.jsonData.clientId,
        client_secret: instanceSettings.jsonData.clientSecret,
        scope: instanceSettings.jsonData.scope
      }
    }
  };
   </code>   
   * 
   * 
   * @param configuration konfiguracja 
   */
  constructor(configuration: any) {
    this.objectName = 'GetData';
    this.accessByAjax = new AjaxMethods();
    this.errorHandler = new ErrorHandler();
    this.connectionDefinition = ConnectionDefinition.getInstance(configuration);
  }

  private checkStatus(methodName: string, requestResult: RequestResult) {
    var message: string;
    var result = requestResult.getResult();
    if (result.status !== undefined) {
      if (result.status !== 'SUCCESS') {
        if (result.message.includes('WRONG_REQUEST')) {
          message = WRONG_REQUEST;
        } else if (result.message.includes('EMPTY_REQUEST')) {
          message = EMPTY_REQUEST;
        } else if (result.message.includes('NO_PAGE_SIZE')) {
          message = NO_PAGE_SIZE;
        } else if (result.message.includes('NO_PAGE_NUMBER')) {
          message = NO_PAGE_NUMBER;
        } else {
          message = OTHER_ERROR;
        }
        message = ERROR_IN_REQUEST + "'" + message + "'";
        this.errorHandler.logException(methodName, message, /* status */ result.status, /* exception */ null);
        requestResult.setIsError(true);
        return;
      }
    }
    if (result.errorCode !== undefined && result.errorCode !== '') {
      var errorCode = result.errorCode;
      var errorMessage = result.errorMessage;
      message = '[' + errorCode + '] ' + errorMessage;
      this.errorHandler.logException(methodName, message, /* status */ 'error_in_result', /* exception */ null);
      requestResult.setIsError(true);
      return;
    }
    requestResult.setIsError(false);
  }

  loadData(
    requestResultCollector: RequestResult,
    serviceUrl: string,
    jsonBody,
    isCache: boolean,
    requestMethod: string
  ) {
    const methodName = this.objectName + '.loadData(' + serviceUrl + ')';

    if (requestResultCollector) {
      var oAuthToken: OAuthToken;
      oAuthToken = this.connectionDefinition.getOAuthToken();
      if (oAuthToken == null) {
        /* brak autoryzacji OAuth - START */
        requestResultCollector = this.internalLoadData(
          methodName,
          requestResultCollector,
          serviceUrl,
          jsonBody,
          isCache,
          requestMethod,
          /* authorizationToken */ null
        );
        /* brak autoryzacji OAuth - KONIEC */
      } else {
        /* wymagana autoryzacji OAuth - START */
        var authorizationToken: string;
        var refreshToken: string;
        authorizationToken = oAuthToken.getAuthorizationToken();
        if (authorizationToken == null) {
          refreshToken = oAuthToken.getRefreshToken();
          if (refreshToken == null) {
            requestResultCollector = this.loadWithAuthorizationToken(
              methodName,
              requestResultCollector,
              serviceUrl,
              jsonBody,
              isCache,
              requestMethod,
              oAuthToken
            );
          } else {
            requestResultCollector = this.loadWitRefreshToken(
              methodName,
              requestResultCollector,
              serviceUrl,
              jsonBody,
              isCache,
              requestMethod,
              oAuthToken
            );
          }
        } else {
          requestResultCollector = this.internalLoadData(
            methodName,
            requestResultCollector,
            serviceUrl,
            jsonBody,
            isCache,
            requestMethod,
            authorizationToken
          );
        }
        /* wymagana autoryzacji OAuth - KONIEC */
      }
    } else {
      /* Kolektor danych musi być zainicjalizowany */
      this.errorHandler.logException(
        methodName,
        REQUEST_COLLECTOR_IS_EMPTY_ERROR,
        /* status */ 'load_data_error',
        /* exception */ null
      );
    }
    return requestResultCollector;
  }

  private loadWithAuthorizationToken(
    methodName: string,
    requestResultCollector: RequestResult,
    serviceUrl: string,
    jsonBody,
    isCache: boolean,
    requestMethod: string,
    oAuthToken: OAuthToken
  ) {
    var authorizationToken: string;
    var authorizationSucces = false;
    var tokenUrl = oAuthToken.getTokenUrl();
    var tokenParams = oAuthToken.getParams();
    this.accessByAjax
      .requestWithParams('POST', tokenUrl, tokenParams, /* isCache */ false, /* token */ null)
      .done((result) => {
        authorizationSucces = oAuthToken.setSessionToken(result);
        authorizationToken = oAuthToken.getAuthorizationToken();
        requestResultCollector.setIsError(!authorizationSucces);
      })
      .fail((result, status, er) => {
        requestResultCollector.setIsError(true);
        this.errorHandler.logException(
          methodName,
          CANT_GET_TOKEN + ' ' + result,
          /* status */ status,
          /* exception */ er
        );
      });

    if (requestResultCollector.getIsError()) {
      return requestResultCollector;
    }
    return this.internalLoadData(
      methodName,
      requestResultCollector,
      serviceUrl,
      jsonBody,
      isCache,
      requestMethod,
      authorizationToken
    );
  }

  private loadWitRefreshToken(
    methodName: string,
    requestResultCollector: RequestResult,
    serviceUrl: string,
    jsonBody,
    isCache: boolean,
    requestMethod: string,
    oAuthToken: OAuthToken
  ) {
    var authorizationToken: string;
    var authorizationSucces = false;
    var tokenUrl = oAuthToken.getTokenUrl();
    var requestPrams = oAuthToken.getRefreshTokenParams();
    this.accessByAjax
      .requestWithParams('POST', tokenUrl, requestPrams, /* isCache */ false, /* token */ null)
      .done((result) => {
        authorizationSucces = oAuthToken.setSessionToken(result);
        authorizationToken = oAuthToken.getAuthorizationToken();
        requestResultCollector.setIsError(!authorizationSucces);
      })
      .fail((result, status, er) => {
        requestResultCollector.setIsError(true);
        this.errorHandler.logException(
          methodName,
          CANT_GET_TOKEN + ' ' + result,
          /* status */ status,
          /* exception */ er
        );
      });

    if (requestResultCollector.getIsError()) {
      return requestResultCollector;
    }
    return this.internalLoadData(
      methodName,
      requestResultCollector,
      serviceUrl,
      jsonBody,
      isCache,
      requestMethod,
      authorizationToken
    );
  }

  private internalLoadData(
    methodName: string,
    requestResultCollector: RequestResult,
    serviceUrl: string,
    jsonBody,
    isCache: boolean,
    requestMethod: string,
    authorizationToken: string
  ) {
    var ajax: any;
    if (requestMethod === 'POST') {
      ajax = this.accessByAjax.requestByPost(serviceUrl, jsonBody, isCache, /* token */ authorizationToken);
    } else {
      ajax = this.accessByAjax.requestByGet(serviceUrl, jsonBody, isCache, /* token */ authorizationToken);
    }
    ajax
      .done((result) => {
        requestResultCollector.setResult(result);
        this.checkStatus(result, requestResultCollector);
      })
      .fail((result, status, er) => {
        requestResultCollector.setIsError(true);
        this.errorHandler.logException(
          methodName,
          /* message */ LOAD_DATA_ERROR + ' ' + result,
          /* status */ status,
          /* exception */ er
        );
      });
    return requestResultCollector;
  }
}
