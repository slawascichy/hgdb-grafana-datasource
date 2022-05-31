import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, HgdbDataSourceOptions, defaultQuery } from './types';
import ContextFactory from './io/hgdb/client/core/ContextFactory';
import ResponseParser from './io/hgdb/client/query/ResponseParser';
import { SERVICE_SERVICE_CONTEXT, DECODE_DATE_AND_LOB, DECODE_NOTHING } from './io/hgdb/client/core/Constants';
import { logDebug, logInfo } from '@grafana/runtime';

export class HgdbDataSource extends DataSourceApi<MyQuery, HgdbDataSourceOptions> {
  id: number;
  name: string;
  baseUrl: string;
  url: string;
  responseParser: ResponseParser;

  backendSrv: any;
  templateSrv: any;
  q: any;

  constructor(instanceSettings: DataSourceInstanceSettings<HgdbDataSourceOptions>, $q, backendSrv, templateSrv) {
    super(instanceSettings);
    this.name = instanceSettings.name;
    this.id = instanceSettings.id;
    this.baseUrl = '/mercurydb';
    this.url = instanceSettings.url;

    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.responseParser = new ResponseParser($q);
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    // Return a constant for each query.
    const data = options.targets.map((target) => {
      const query = defaults(target, defaultQuery);
      return new MutableDataFrame({
        refId: query.refId,
        fields: [
          { name: 'Time', values: [from, to], type: FieldType.time },
          { name: 'Value', values: [query.constant, query.constant], type: FieldType.number },
        ],
      });
    });

    return { data };
  }

  async testDatasource() {
    /* Start metody testDatasource */
    logInfo('--> testDatasource: START');
    var contextFactory = ContextFactory.getInstance();
    var context = contextFactory.createContext({
      userName: 'anonymous',
      userFullName: null,
      locale: null,
      timeZone: null,
      maxResults: 1,
      currentRole: 'anonymous',
      userRoles: null,
      sourceOfRequest: null,
      maxDepthResult: 1,
      decodeResult: DECODE_DATE_AND_LOB,
      ignoreCaseHeaderInResponse: false,
    });
    var jsonBody = {
      context: context,
      someText: 'testDatasource',
    };
    var serviceUrl = this.baseUrl + SERVICE_SERVICE_CONTEXT + '/CaseBusinessRest/echo';
    logInfo('--> testDatasource: serviceUrl: ' + serviceUrl);
    return this.backendSrv
      .datasourceRequest({
        url: this.url + serviceUrl,
        method: 'POST',
        data: jsonBody,
      })
      .then((response) => {
        if (response.status === 200) {
          return {
            status: 'success',
            message: 'Successfully queried the Mercury database.',
            title: 'Success',
          };
        }
        return {
          status: 'error',
          message: 'Returned http status code ' + response.status,
          title: 'Error',
        };
      })
      .catch((error) => {
        let message = 'Mercury: ';
        message += error.statusText ? error.statusText + ': ' : '';
        if (error.data && error.data.Message) {
          message += error.data.Message;
        } else if (error.data) {
          message += error.data;
        } else {
          message += 'Cannot connect to the Mercury REST API.';
        }
        return {
          status: 'error',
          message: message,
          title: 'Error',
        };
      });
    /* Koniec metody testDatasource */
  }
}
