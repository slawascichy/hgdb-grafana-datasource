///<reference path="../node_modules/grafana-sdk-mocks/app/headers/common.d.ts" />

import _ from 'lodash';
import {QueryCtrl} from 'app/plugins/sdk';
import './css/query_editor.css!';

export class HgDBQueryCtrl extends QueryCtrl {
  static templateUrl = 'partials/query.editor.html';

  defaults = {
  };

  /** @ngInject **/
  constructor($scope, $injector) {
    super($scope, $injector);

    _.defaultsDeep(this.target, this.defaults);

    this.target.target = this.target.target || 'metricA';
    this.target.type = this.target.type || 'dateMetricQuery';
    this.target.luceneQuery = this.target.luceneQuery || 'mrc_status:A';
    this.target.dateFieldName =  this.target.dateFieldName || 'mrc_createDate';
    this.target.sortAscending =  this.target.sortAscending || 'desc';
    this.target.pageSize =  this.target.pageSize || 100;

  }

  /** Pobieranie nazw pól reprezentujących daty */
  getDateFielsdNames(query) {
    var fieldNamesList = ["mrc_createDate", "mrc_lastModifyDate"];
    return _.map(fieldNamesList, (d, i) => {
      return {text : d, value: d};
    })
  }

  getOptions(query) {
    return [];
  }

  onChangeInternal() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }
}
