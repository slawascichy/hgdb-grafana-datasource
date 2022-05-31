import { SERVICE_APP_CONTEXT, SERVICE_REST_CONTEXT, SERVICE_SERVICE_CONTEXT } from './Constants';
import OAuthToken from './OAuthToken';

export default class ConnectionDefinition {

  private static instance: ConnectionDefinition;
  private configuration: any;
  private severUrl: string;
  private oAuthToken: OAuthToken;

  constructor(configuration: any) {
    this.configuration = configuration;
    this.severUrl = configuration.serverUrl;
    if (configuration.securityUrl != null) {
      this.oAuthToken = new OAuthToken(configuration.securityUrl);
    } else {
      this.oAuthToken = null;
    }
  }

  getOAuthToken(): OAuthToken {
    return this.oAuthToken;
  }

  getRemotePaths() {
    return {
      serviceApp: this.severUrl + SERVICE_APP_CONTEXT,
      rest: this.severUrl + SERVICE_REST_CONTEXT,
      service: this.severUrl + SERVICE_SERVICE_CONTEXT,
    }
  }

  getConfiguration() {
    return this.configuration;
  }

  static getInstance(configuration: any): ConnectionDefinition {
    if (!ConnectionDefinition.instance) {
      ConnectionDefinition.instance = new ConnectionDefinition(configuration);
    }
    return ConnectionDefinition.instance;
  }

}