import {
  APP_NAME,
  APP_VERSION,
  SOURCE_OF_REQUEST,
  ROOT_CONTEXT_ID,
  DATE_LONG_FORMAT,
  DATE_SHORT_FORMAT,
} from './Constants';
export default class ContextFactory {
  private static instance: ContextFactory;

  static getInstance(): ContextFactory {
    if (!ContextFactory.instance) {
      ContextFactory.instance = new ContextFactory();
    }
    return ContextFactory.instance;
  }

  /**
   * Utworzenie obiektu kontekstu
   *
   * @param param0 parametry kontekstu
   */
  createContext(
    {
      userName,
      userFullName,
      locale,
      timeZone,
      maxResults,
      currentRole,
      userRoles,
      sourceOfRequest,
      maxDepthResult,
      decodeResult,
      ignoreCaseHeaderInResponse
    }: {
      userName: string;
      userFullName: string;
      locale: string;
      timeZone: string;
      maxResults: number;
      currentRole: string;
      userRoles: string[];
      sourceOfRequest: string;
      maxDepthResult: number;
      decodeResult: string;
      ignoreCaseHeaderInResponse: boolean
    }) {

    var trustedData = false;

    if (userFullName != null) {
      trustedData = true;
    }
    if (locale == null) {
      locale = 'pl_PL';
    }
    if (timeZone == null) {
      timeZone = 'Europe/Warsaw';
    }
    if (maxResults == null) {
      maxResults = 500000;
    }
    if (sourceOfRequest == null) {
      sourceOfRequest = SOURCE_OF_REQUEST;
    }
    if (maxDepthResult == null) {
      maxDepthResult = 3;
    }
    if (userRoles == null) {
      userRoles = [currentRole];
    }
    return {
      appName: APP_NAME,
      appVersion: APP_VERSION,
      userName: userName,
      comment: null,
      maxResults: maxResults,
      queryTimeout: 2147483647,
      locale: locale,
      timeZone: timeZone,
      userFullName: userFullName,
      eager4omdBuilder: 'true',
      trustedData: trustedData,
      ignoredCustomFields: null,
      currentRole: currentRole,
      userRoles: userRoles,
      sourceOfRequest: sourceOfRequest,
      rootVersionContextID: ROOT_CONTEXT_ID,
      directRequest: false,
      formats: {
        'date.format.long': DATE_LONG_FORMAT,
        'date.format.short': DATE_SHORT_FORMAT,
      },
      ignoreAlternateFields: true,
      decodeResult: decodeResult,
      maxDepthResult: maxDepthResult,
      decodeRequest: 'DATE_AND_LOB',
      ignoreCaseHeaderInResponse: ignoreCaseHeaderInResponse,
      cacheUsage: 'TO_USE',
      httpResponseCacheUsage: 'NONE',
      defaultLuceneSortClause: null,
      viewDefinition: null
    };
  }
}