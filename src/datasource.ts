///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import _ from 'lodash';
import ContextFactory from './io/hgdb/client/core/ContextFactory';
import ResponseParser from './io/hgdb/client/query/ResponseParser';
import { SERVICE_SERVICE_CONTEXT, DECODE_DATE_AND_LOB, DECODE_NOTHING } from './io/hgdb/client/core/Constants';
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

  async query(options) {
    console.log("-->query.options", options);
    const seriesList = [];
  
    var contextFactory = ContextFactory.getInstance();
    var context = contextFactory.createContext({
      userName: "anonymous",
      userFullName: null,
      locale: null,
      timeZone: null,
      maxResults: 10000,
      currentRole: "anonymous",
      userRoles: null,
      sourceOfRequest: null,
      maxDepthResult: 1,
      decodeResult: DECODE_NOTHING
    });

    for (let target of options.targets) {
      if (target.type == 'fieldMetricQuery') {
        seriesList.push(this.fieldMetricQuery(context, target, options));
      } else if (target.type == 'dateMetricQuery') {
        let x = await this.dateMetricQuery(context, target, options);
        seriesList.push(x);
      } else if (target.type == 'groupByQuery') {
        seriesList.push(this.groupByQuery(context, target, options));
      } else {
        seriesList.push(this.searchByQuery(context, target, options));
      }
    }
    console.log("-->seriesList", seriesList);
    return { data: seriesList };
  }

  annotationQuery(options) {
    throw new Error("Annotation Support not implemented yet.");
  }

  /** Zapytanie metryczne, usługa /fieldMetricQuery */
  fieldMetricQuery(context, target, optionalOptions) {
    console.log("fieldMetricQuery", target);
    return {
      target : target.target,
      datapoints : []
    };
  }

  /** Zapytanie metryczne, usługa /dateMetricQuery */
  dateMetricQuery(context, target, optionalOptions) {
    console.log("dateMetricQuery", target);
    var dateFieldName = target.dateFieldName;
    var sortAscending = target.sortAscending && target.sortAscending == "asc";
    var pageSize = optionalOptions.maxDataPoints;
    
    /* ustalenie przedziału czasowego - START */
    /* domyślnie co minutę */
    var duration = "PER_MINUTE";
    var interval = optionalOptions.intervalMs;
    if (interval > 86400000) {
      /* 86400000 - 1d */ 
      duration = "PER_DAY";
    } else if (interval > 3600000) {
      /* 3600000 - 1h */
      duration = "PER_HOUR";
    } 
    /* ustalenie przedziału czasowego - KONIEC */
    
    var rangeFrom = ("" + optionalOptions.range.from._i).split(".")[0];
    var rangeTo = ("" + optionalOptions.range.to._i).split(".")[0];

    var luceneQuery = 
      "(" + target.luceneQuery + ") AND " + dateFieldName + ":[" + rangeFrom + " TO " + rangeTo + "]";
    console.log("luceneQuery", luceneQuery);

    var jsonBody = {
      "context": context,
      "dateFieldsNames": [dateFieldName],
      "duration": duration,
      "luceneQuery": luceneQuery,
      "sortAscending": sortAscending,
      "page": {
        "size": pageSize,
        "number": 1
      }
    };

    var serviceUrl = this.baseUrl + SERVICE_SERVICE_CONTEXT + '/CaseSearchExtRest/dateMetricQuery';
    return this.backendSrv.datasourceRequest({
      url: this.url + serviceUrl,
      method: 'POST',
      data: jsonBody,
      async: false
    })
      .then(response => {
        if (response.status === 200) {

          var dataResult = response.data.result;
          var datapointsResult = [];
          var ix = 0; 
          for (let dataRow of dataResult) {
            eval("datapointsResult[ix] = [" + dataRow.B + "," + dataRow.A + "];");
            ix++;
          }
          return {
            target : target.target,
            datapoints : datapointsResult
          };
        } else {
          return {
            target : target.target,
            datapoints : []
          }
        }
      });
  }

  /** Zapytanie grupujące, usługa /groupByQuery */
  groupByQuery(context, target,  optionalOptions) {
    console.log("groupByQuery", target);
    return {
      target : target.target,
      datapoints : []
    };
  }

  /** Zapytanie wyszukujące, usługa /searchByQuery */
  searchByQuery(context, target, optionalOptions) {
    console.log("searchByQuery", target);
    return {
      target : target.target,
      datapoints : []
    };
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
      maxDepthResult: 1,
      decodeResult: DECODE_DATE_AND_LOB
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
