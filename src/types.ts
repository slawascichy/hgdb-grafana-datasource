import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  queryText?: string;
  constant: number;
}

export const defaultQuery: Partial<MyQuery> = {
  constant: 6.5,
};

/**
 * These are options configured for each DataSource instance
 */
export interface HgdbDataSourceOptions extends DataSourceJsonData {
  serverUrl?: string;
  username?: string;
  clientId?: string;
  clientSecret?: string;
  accesTokenURI?: string;
  scope?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface HgdbSecureJsonData {
  ownerPassword?: string;
}
