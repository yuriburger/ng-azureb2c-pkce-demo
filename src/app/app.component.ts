import { Component } from '@angular/core';
import {
  OAuthErrorEvent,
  OAuthEvent,
  OAuthService,
} from 'angular-oauth2-oidc';
import { authCodeFlowConfig } from './authconfig';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(readonly oauthService: OAuthService) {
    this.oauthService.configure(authCodeFlowConfig);
    this.oauthService.setupAutomaticSilentRefresh();

    this.oauthService.events.subscribe((event: OAuthEvent) => {
      if (event.type === 'token_received') {
        console.debug('logged in');
      }
    });

    const url =
      authCodeFlowConfig.issuer +
      '.well-known/openid-configuration?p=b2c_1_signupandsignin';

    // The convenience method mentioned in the docs (loadDiscoveryDocumentAndLogin) won't work
    // since we need a way to modify the token endpoint
    this.oauthService
      .loadDiscoveryDocument(url)
      .then((_) => {
        if (this.userHasEnteredPasswordResetFlow()) {
          // We need to change to token endpoint to match the reset-password flow
          this.oauthService.tokenEndpoint.replace(
            'b2c_1_signupandsignin',
            'b2c_1_passwordreset'
          );
        }

        return this.oauthService.tryLoginCodeFlow();
      })
      .then((_) => {
        if (!this.oauthService.hasValidAccessToken()) {
          this.oauthService.initCodeFlow();
        }
      })
      .catch((err) => {
        if (this.userHasRequestedPasswordReset(err)) {
          // In this case we need to enter a different flow on the Azure AD B2C side.
          // This is still a valid Code + PKCE flow, but uses a different form to support self service password reset
          this.oauthService.loginUrl = this.oauthService.loginUrl.replace(
            'b2c_1_signupandsignin',
            'b2c_1_passwordreset'
          );
          // Add this to the state as we need it on our way back
          this.oauthService.initCodeFlow('PASSWORD_RESET');
        } else {
          // Another error has occurred, e.g. the user cancelled the reset-password flow.
          // In that case, simply retry the login.
          this.oauthService.initCodeFlow();
        }
      });
  }

  private userHasEnteredPasswordResetFlow(): boolean {
    return window.location.search.indexOf('PASSWORD_RESET') > -1;
  }

  private userHasRequestedPasswordReset(err: OAuthErrorEvent): boolean {
    return (err.params['error_description'] as string).startsWith(
      'AADB2C90118'
    );
  }

  refresh() {
    this.oauthService.refreshToken();
  }

  logout() {
    this.oauthService.logOut();
  }
}
