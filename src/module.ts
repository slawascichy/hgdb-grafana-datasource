import { DataSourcePlugin } from '@grafana/data';
import { HgdbDataSource } from './datasource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { MyQuery, HgdbDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<HgdbDataSource, MyQuery, HgdbDataSourceOptions>(HgdbDataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
