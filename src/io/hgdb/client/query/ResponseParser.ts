import _ from 'lodash';
import q from 'q';

export default class ResponseParser {
    constructor(private $q) {}
  
    echoResult(refId: string, res) {
      return { data: res };
    }
  
    processDateMetricQueryResult(refId: string, res: any) {

      console.log("-->processQueryResult: $q", this.$q);
      console.log("-->processQueryResult: refId", refId);
      console.log("-->processQueryResult: res", res);
      return {
        target : "target.target",
        datapoints : []
      };
    }
 
  }