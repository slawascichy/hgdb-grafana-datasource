///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import _ from 'lodash';
import ContextFactory from './io/hgdb/client/core/ContextFactory';
import ResponseParser from './io/hgdb/client/query/ResponseParser';
import { SERVICE_SERVICE_CONTEXT } from './io/hgdb/client/core/Constants';
import MercuryResponse from './metcury_response';

export default class HgDBDatasource {
  id: number;
  name: string;
  baseUrl: string;
  url: string;
  responseParser: ResponseParser;


  /** @ngInject */
  constructor(instanceSettings, private backendSrv, private templateSrv, private $q, private timeSrv) {
    this.name = instanceSettings.name;
    this.id = instanceSettings.id;
    this.baseUrl = '/mercurydb';
    this.url = instanceSettings.url;
    this.responseParser = new ResponseParser(this.$q);

  }

  query(options) {
    console.log("query", options);
    const seriesList = [];

    return { data: seriesList };
  }

  annotationQuery(options) {
    throw new Error("Annotation Support not implemented yet.");
  }

  metricFindQuery(query: string, optionalOptions) {
    console.log("metricFindQuery", query);
    return [];
  }

  testDatasource() {
    var contextFactory = ContextFactory.getInstance();
    var context = contextFactory.createContext({
      userName: "anonymous",
      userFullName: null,
      locale: null,
      timeZone: null,
      maxResults: 1,
      currentRole: "anonymous",
      userRoles: null,
      sourceOfRequest: null,
      maxDepthResult: 1
    });
    var jsonBody = {
      "context": context,
      "someText": "testDatasource"
    };
    var serviceUrl = this.baseUrl + SERVICE_SERVICE_CONTEXT + '/CaseBusinessRest/echo';
    return this.backendSrv.datasourceRequest({
        url: this.url + serviceUrl,
        method: 'POST',
        data: jsonBody
      })
      .then(response => {
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
          title: "Error"
        };
      })
      .catch(error => {
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
          title: "Error"
        };
      });
  }
}
