import OAuthUtils from '../Utils/OAuthUtils';
import Session from "../Utils/Session";

/**
 * Class representing PingOne Authorization API's integration.
 * This demo-specific class is developed and maintained by Ping Identity Technical Enablement.
 * Implements methods to integrate with PingOne authentication-related API endpoints.
 * 
 * This is a modified version of what comes with the live BXRetail app. This component was
 * stripped down to only what was necessary for the Terraform labs.
 * 
 * @author Michael Sanchez, Technical Enablement
*/

class PingOneAuthZ {
    authzEndpoint = '/as/authorize';
    tokenEndpoint = '/as/token';

    /**
    Class constructor
     * @param {string} authPath PingOne auth path for your regions tenant.
     * @param {string} envId PingOne environment ID needed for authZ integrations.
     */
    constructor(authPath, envId) {
        this.authPath = authPath;
        this.envId = envId;
        this.OAuthUtils = new OAuthUtils();
        this.Session = new Session();
        this.envVars = window._env_;
    }

    /**
     * Authorization endpoint
     * Redirects the user to the authorize endpoint at PingOne.
     * 
     * {@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#openid-connectoauth-2}
     * {@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#get-authorize-authorization_code}
     * 
     * @param {string} responseType The OAuth grant type. Options are "code" and "token".
     * @param {string} clientId The client ID of the OAuth application.
     * @param {string} redirectURI The URL to which the OAuth AS should redirect the user with a flowId.
     * @param {string} scopes The OAuth scopes needed for the given for which the user is being authorized.
     */
    async authorize({ responseType, clientId, redirectURI, scopes }) {
        console.info(
            'Integration.PingOneAuthZ.js',
            'Sending user to the authorize endpoint to start an authN flow and get a flowId.'
        );

        let url =
            this.envVars.REACT_APP_P1HOST +
            '/' +
            this.envVars.REACT_APP_ENVID +
            '/as/authorize?response_type=' +
            responseType +
            '&client_id=' +
            clientId +
            '&redirect_uri=' +
            redirectURI +
            '&scope=' +
            scopes;

        // Add pkce support for auth code grant types
        if (responseType === 'code') {
            const state = this.OAuthUtils.getRandomString(20);
            const code_verifier = this.OAuthUtils.getRandomString(128);
            let code_challenge;

            try {
                code_challenge = await this.OAuthUtils.generateCodeChallenge(code_verifier);
            } catch (e) {
                console.error('Integration.PingOneAuthZ.js', 'Error generating code challenge', e);
                throw new Error('Integration.PingOneAuthZ.js', 'Unexpected exception in generateCodeChallenge().');
            }

            // Save pkce code_verifier and state values
            this.Session.setAuthenticatedUserItem('state', state, 'session');
            this.Session.setAuthenticatedUserItem('code_verifier', code_verifier, 'session');

            url += '&state=' + state + '&code_challenge=' + code_challenge + '&code_challenge_method=S256';
        }

        window.location.assign(url);
    }

    /**
     * OAuth Token
     * Swaps an OAuth code for an OAuth access token.
     * {@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-token-authorization_code-none}
     * 
     * @param {string} code Authorization code from AS.
     * @param {string} redirectURI App URL user should be redirected to after swap for token.
     * @returns {object} JSON formatted response object.
     */
    async getToken({ code, redirectURI, swaprods, clientId }) {
        console.info('Integration.PingOneAuthZ.js', 'Swapping an authorization code for an access token.');

        let myHeaders = new Headers();
        // myHeaders.append('Authorization', 'Basic ' + swaprods);
        myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

        let urlencoded = new URLSearchParams();
        urlencoded.append('grant_type', 'authorization_code'); // Grant type should ideally be a param passed in. But in the demos we're only doing auth code.
        urlencoded.append('code', code);
        urlencoded.append('redirect_uri', redirectURI);
        urlencoded.append('client_id', clientId);
        urlencoded.append('code_verifier', this.Session.getAuthenticatedUserItem('code_verifier', 'session'));
        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            body: urlencoded,
            redirect: 'manual',
        };
        const url = this.authPath + '/auth/' + this.envVars.REACT_APP_ENVID + '/as/token';
        const response = await fetch(url, requestOptions);
        const jsonResponse = await response.json();
        return jsonResponse;
    }
}
export default PingOneAuthZ;