import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { HgdbDataSourceOptions, HgdbSecureJsonData } from './types';

const { SecretFormField, FormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<HgdbDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {

  onServerUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      serverUrl: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onUserNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      username: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  // Secure field (only sent to the backend)
  onOwnerPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonData: {
        ownerPassword: event.target.value,
      },
    });
  };

  onResetOwnerPassword = () => {
    const { onOptionsChange, options } = this.props;
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        ownerPassword: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        ownerPassword: '',
      },
    });
  };

  onClientIDChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      clientId: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onClientSecretChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      clientSecret: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onAccesTokenURIChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      accesTokenURI: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  onScopeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onOptionsChange, options } = this.props;
    const jsonData = {
      ...options.jsonData,
      scope: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };


  render() {
    const { options } = this.props;
    const { jsonData, secureJsonFields } = options;
    const secureJsonData = (options.secureJsonData || {}) as HgdbSecureJsonData;

    return (
      <div className="gf-form-group">
        <div className="gf-form">
          <FormField
            label="Server URL"
            labelWidth={8}
            inputWidth={20}
            onChange={this.onServerUrlChange}
            value={jsonData.serverUrl || ''}
            placeholder="Podaj adres serwera HgDB np. http://localhost:8080"
          />
        </div>
        <div className="gf-form-inline">
          <div className="gf-form">
            <FormField
              label="Resource Owner"
              labelWidth={8}
              inputWidth={20}
              onChange={this.onUserNameChange}
              value={jsonData.username || ''}
              placeholder="(Opcjonalnie) Podaj nazwę użytkownika"
            />
          </div>
          <div className="gf-form">
            <SecretFormField
              isConfigured={(secureJsonFields && secureJsonFields.ownerPassword) as boolean}
              value={secureJsonData.ownerPassword || ''}
              label="Owner Password"
              placeholder="(Opcjonalnie, backend only) Podaj hasło użytkownika"
              labelWidth={8}
              inputWidth={20}
              onReset={this.onResetOwnerPassword}
              onChange={this.onOwnerPasswordChange}
            />
          </div>
        </div>
        <div className="gf-form">
          <FormField
            label="Client ID"
            labelWidth={8}
            inputWidth={20}
            onChange={this.onClientIDChange}
            value={jsonData.clientId || ''}
            placeholder="(Opcjonalnie) Podaj identyfikator klienta"
          />
        </div>
        <div className="gf-form">
          <FormField
            label="Client Secret"
            labelWidth={8}
            inputWidth={20}
            onChange={this.onClientSecretChange}
            value={jsonData.clientSecret || ''}
            placeholder="(Opcjonalnie) Podaj hasło klienta"
          />
        </div>
        <div className="gf-form">
          <FormField
            label="Access Token URI"
            labelWidth={8}
            inputWidth={20}
            onChange={this.onAccesTokenURIChange}
            value={jsonData.accesTokenURI || ''}
            placeholder="(Opcjonalnie) Podaj adres URI pobierania tokenu"
          />
        </div>
        <div className="gf-form">
          <FormField
            label="Scope"
            labelWidth={8}
            inputWidth={20}
            onChange={this.onScopeChange}
            value={jsonData.scope || ''}
            placeholder="(Opcjonalnie) Podaj zakres dostępu"
          />
        </div>
      </div>
    );
  }
}
