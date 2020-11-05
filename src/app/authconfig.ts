import { AuthConfig } from 'angular-oauth2-oidc';

  export const authCodeFlowConfig: AuthConfig = {
    issuer: 'https://provisioningdemodev.b2clogin.com/aececa87-a01b-4e0f-b7fd-58b18b2fc1c8/v2.0/',
    redirectUri: window.location.origin + '/index.html',
    clientId: '3db90be7-e597-417d-882d-4e5197d56a94',
    responseType: 'code',
    strictDiscoveryDocumentValidation: false,
    scope: 'openid offline_access https://provisioningdemodev.onmicrosoft.com/ng-azureb2c-pkce-demo/api',
    showDebugInformation: false,
  };