import HgDBDatasource from './datasource';
import {HgDBQueryCtrl} from './query_ctrl';
import {HgDBConfigCtrl} from './config_ctrl';

class ChangeMyNameAnnotationsQueryCtrl {
  static templateUrl = 'partials/annotations.editor.html';
}

export {
  HgDBDatasource as Datasource,
  HgDBQueryCtrl as QueryCtrl,
  HgDBConfigCtrl as ConfigCtrl,
  ChangeMyNameAnnotationsQueryCtrl as AnnotationsQueryCtrl,
};
