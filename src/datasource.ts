import _ from 'lodash';
import ContextFactory from './io/hgdb/client/core/ContextFactory';
import ResponseParser from './io/hgdb/client/query/ResponseParser';
import { SERVICE_SERVICE_CONTEXT, DECODE_DATE_AND_LOB, DECODE_NOTHING } from './io/hgdb/client/core/Constants';

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
      decodeResult: DECODE_NOTHING,
      ignoreCaseHeaderInResponse: true
    });

    for (let target of options.targets) {
      if (target.type == 'fieldMetricQuery') {
        let series = await this.fieldMetricQuery(context, target, options);
        seriesList.push(series);
      } else if (target.type == 'dateMetricQuery') {
        let series = await this.dateMetricQuery(context, target, options);
        seriesList.push(series);
      } else if (target.type == 'groupByQuery') {
        let series = await this.groupByQuery(context, target, options);
        seriesList.push(series);
      } else {
        let series = await this.searchByQuery(context, target, options);
        seriesList.push(series);
      }
    }
    console.log("-->query.seriesList", seriesList);
    return { data: seriesList };
  }

  annotationQuery(options) {
    throw new Error("Annotation Support not implemented yet.");
  }

  /** Zapytanie metryczne, usługa /fieldMetricQuery */
  fieldMetricQuery(context, target, optionalOptions) {
    console.log("fieldMetricQuery", target);
    return {
      target: target.target,
      datapoints: []
    };
  }

  /** Zapytanie metryczne, usługa /dateMetricQuery */
  dateMetricQuery(context, target, optionalOptions) {
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

    var rangeFrom = optionalOptions.range.from._d.getTime();
    var rangeTo = optionalOptions.range.to._d.getTime();

    var luceneQuery =
      "(" + target.luceneQuery + ") AND " + dateFieldName + ":[" + rangeFrom + " TO " + rangeTo + "]";

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
        if (response.status === 200 && response.data.message != "NO_DATA_FOUND") {
          var dataResult = response.data.result;
          var datapointsResult = [];
          let lastTime = 0;
          let diffTime = 60000;
          if (duration == "PER_DAY") {
            diffTime = diffTime * 60 * 24;
          } else if (duration == "PER_HOUR") {
            diffTime = diffTime * 60;
          }
          for (let i = 0; i < dataResult.length; i++) {
            let currTime = +dataResult[i].A;
            let currValue = +dataResult[i].B;

            if (lastTime < currTime - diffTime) {
              datapointsResult.push([0, currTime - diffTime]);
            }
            datapointsResult.push([currValue, currTime]);

            if (i < dataResult.length - 1) {
              let nextValue = +dataResult[i + 1].A;
              if (nextValue > currTime + diffTime) {
                datapointsResult.push([0, currTime + diffTime]);
              }
            } else if (rangeTo - currTime > diffTime) {
              datapointsResult.push([0, currTime + diffTime]);
            }


            lastTime = currTime;
          }
          return {
            target: target.target,
            datapoints: datapointsResult
          };
        } else {
          return {
            target: target.target,
            datapoints: []
          }
        }
      });
  }

  /** Zapytanie grupujące, usługa /groupByQuery */
  groupByQuery(context, target, optionalOptions) {
   
    context.ignoreCaseHeaderInResponse = true;
    context.decodeResult = DECODE_DATE_AND_LOB;
    context.maxResults = 100000;

    var dateFieldName = target.dateFieldName;
    var pageSize = optionalOptions.maxDataPoints;

    var rangeFrom = optionalOptions.range.from._d.getTime();
    var rangeTo = optionalOptions.range.to._d.getTime();

    var luceneQuery =
      "(" + target.luceneQuery + ") AND " + dateFieldName + ":[" + rangeFrom + " TO " + rangeTo + "]";
    var groupByClause = target.groupByClause;

    var jsonBody = {
      "context": context,
      "query": luceneQuery,
      "groupByClause": groupByClause,
      "page": {
        "size": pageSize,
        "number": 1
      }
    };
    var serviceUrl = this.baseUrl + SERVICE_SERVICE_CONTEXT + '/CaseSearchExtRest/groupByQuery';
    return this.backendSrv.datasourceRequest({
      url: this.url + serviceUrl,
      method: 'POST',
      data: jsonBody,
      async: false
    })
      .then(response => {
        if (response.status === 200 && response.data.dto.message != "NO_DATA_FOUND") {
          var dataResult = response.data.dto.result;
          var responseRows = [];
          var responseColumns = [];
          for (let i = 0; i < dataResult.length; i++) {
            let datarow = dataResult[i];
            var row = [];
            for (let label in datarow) {
              if (i == 0) {
                responseColumns.push({text: label});
              }
              row.push(datarow[label]);
            }
            responseRows.push(row);
          }
          return {
            columns: responseColumns,
            rows: responseRows,
            type: "table"
          }
        } else {
          return {
            columns: [],
            rows: [],
            type: "table"
          }
        }
      });
  }

  /** Zapytanie wyszukujące, usługa /searchByQuery */
  searchByQuery(context, target, optionalOptions) {
    console.log("searchByQuery", target);
    return {
      target: target.target,
      datapoints: []
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
      decodeResult: DECODE_DATE_AND_LOB,
      ignoreCaseHeaderInResponse: false
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
