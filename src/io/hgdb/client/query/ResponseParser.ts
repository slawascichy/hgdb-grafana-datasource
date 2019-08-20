import _ from 'lodash';

export default class ResponseParser {
    constructor(private $q) {}
  
    echoResult(refId, res) {
      return { data: res };
    }
  
 
  }