import _ from 'lodash';
import TableModel from 'app/core/table_model';

export default class MercuryResponse {

    constructor(private targets, private response) {
      this.targets = targets;
      this.response = response;
    }
}