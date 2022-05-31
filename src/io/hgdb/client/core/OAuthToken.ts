import {
  WRONG_PASSWORD,
  INVALID_SCOPE,
  INVALID_CLIENT_ID,
  INVALID_GRANT,
} from './Constants';
import ErrorHandler from './ErrorHandler';

export default class OAuthToken {

  objectName: string;
  private errorHandler: ErrorHandler;
  private tokenUrl: string;
  private params: {
    grant_type: string;
    username: string;
    password: string;
    client_id: string;
    client_secret: string;
    scope: string;
  };
  private sessionToken: {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
  };
  private startTime: number;

  constructor(securityUrl: any) {
    this.objectName = 'OAuthToken';
    this.tokenUrl = securityUrl.tokenUrl;
    this.params = securityUrl.params;
    this.sessionToken = null;
    this.errorHandler = new ErrorHandler();
  }

  setSessionToken(sessionToken: any) {
    const methodName = this.objectName + '.setSessionToken';
    var error = sessionToken.error;
    if (error !== undefined && error != null && error !== '') {
      var errorInSideResult: any;
      /* błąd nie jest pusty - START */
      switch (error) {
        case 'password_required':
          errorInSideResult = WRONG_PASSWORD;
          break;

        case 'invalid_scope':
          errorInSideResult = INVALID_SCOPE;
          break;

        case 'invalid_client':
          errorInSideResult = INVALID_CLIENT_ID;
          break;

        case 'invalid_grant':
          errorInSideResult = INVALID_GRANT;
          break;
        default:
          errorInSideResult = error;
      }
      this.errorHandler.logException(methodName, /* message */ errorInSideResult, /* status */ 'oauth_error', /* exception */ null);
      return false;
      /* błąd nie jest pusty - KONIEC */
    }
    this.sessionToken = {
      access_token: sessionToken.access_token,
      expires_in: sessionToken.expires_in,
      refresh_token: sessionToken.refresh_token,
      scope: sessionToken.scope,
      token_type: sessionToken.token_type,
    };
    this.startTime = Date.now();
    return true;
  }

  getTokenUrl() {
    return this.tokenUrl;
  }

  isExpired() {
    var expiresDate: number;

    if (this.sessionToken == null) {
      return true;
    }
    var currDate = Date.now();
    expiresDate = (
      /* czas ustawienia tokena */
      this.startTime
      /* czas ekspiracji tokena */
      + (this.sessionToken.expires_in * 1000)
      /* odejmuję 1s dla bezpieczeństwa */
      - 1000
    );
    return currDate > expiresDate;
  }

  getRefreshToken() {
    var expiresDate: number;
    var refreshToken: string;
    if (this.sessionToken == null) {
      return null;
    }
    var currDate = Date.now();
    expiresDate = (
      /* czas ustawienia tokena */ this.startTime + /* czas ekspiracji tokena */ this.sessionToken.expires_in * 1000 + /* czas ekspiracji tokena do odświeżania */ 60 * 60 * 1000 - /* odejmuję 1s dla bezpieczeństwa */ 1000
    );
    if (currDate > expiresDate || !this.sessionToken.refresh_token) {
      return null;
    }
    return this.sessionToken.refresh_token;
  }

  getAuthorizationToken() {
    var authorizationToken: string;
    if (this.sessionToken == null || this.isExpired() || !this.sessionToken.access_token) {
      return null;
    }
    return this.sessionToken.token_type + ' ' + this.sessionToken.access_token;
  }

  getParams() {
    return this.params;
  }

  getRefreshTokenParams() {
    if (this.getParams() == null) {
      return null;
    }
    return {
      grant_type: 'refresh_token',
      refresh_token: this.getRefreshToken(),
      client_id: this.params.client_id,
      client_secret: this.params.client_secret,
      scope: this.params.scope,
    };
  }
}
