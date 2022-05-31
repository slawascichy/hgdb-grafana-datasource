import _ from 'lodash';

export default class ResponseParser {
  constructor(private $q) { }

  echoResult(refId: string, res) {
    return { data: res };
  }

  processDateMetricQueryResult(res: any) {
    console.log('-->processQueryResult: $q', this.$q);
    console.log('-->processQueryResult: res', res);
    return {
      target: 'target.target',
      datapoints: [],
    };
  }
}
