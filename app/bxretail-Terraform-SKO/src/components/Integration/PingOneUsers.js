/**
 * Class representing users in PingOne Directory.
 *
 * This demo-specific class is developed and maintained by Ping Identity Technical Enablement.
 * Implements methods to integrate with PingOne via the management or authetnication APIs.
 * 
 * This is a modified version of what comes with the live BXRetail app. This component was
 * stripped down to only what was necessary for the Terraform labs.
 *
 * @author Michael Sanchez, Technical Enablement
 */

class PingOneUsers {
    /**
     * Class constructor
     * 
     * @param {object} Child object within the global window object that contains our env vars.
    */
    constructor(envVars) {
        this.envId = envVars.REACT_APP_ENVID;
        this.authPath = envVars.REACT_APP_AUTHPATH;
        this.p1Host = envVars.REACT_APP_P1HOST;
        this.envVars = envVars;
    }

    /**
     * Read User:
     * Read one user's account data.
     * 
     * @param {string} userId User Id, as GUID, of the user from which to read data.
     * @param {string} token User bearer token.
     * @return {object} Raw response object of user data from PingOne.
     * {@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#get-read-one-user}
    */
    async readUser({ userId, token }) {
        console.info('Integration.PingOneUsers.js', "Reading user's data.");

        // Not best practice. Just doing it here because the demo is about Terraform deploying this app.
        // appProxyHost = 'https://<k8s deploy name>-proxy.<k8s deploy domain>.com';
        // E.g. appProxyHost = 'https://sko23-bxr-tf-proxy.ping-devops.com';

        let domain = this.envVars.REACT_APP_HOST.split('.')[1];
        let insertPosition = this.envVars.REACT_APP_HOST.indexOf(domain) - 1;
        let appProxyHost = this.envVars.REACT_APP_HOST.slice(0, insertPosition) + '-proxy' + this.envVars.REACT_APP_HOST.slice(insertPosition);
        console.log('appProxyHost', appProxyHost);
        

      
        let myHeaders = new Headers();
        myHeaders.append('Authorization', 'Bearer ' + token);
        
        let requestOptions = {
            method: 'GET',
            headers: myHeaders,
            redirect: 'manual',
        };
        // {{apiPath}}/environments/{{envID}}/users/{{userID}}?expand=population
        const url = appProxyHost + '/user/' + this.envId + '/users/' + userId + '?expand=population';
        const response = await fetch(url, requestOptions);

        return response;
    }

    /**
     * OIDC User Info endpoint
     * Calls the OAuth user info endpoint at PingOne.
     *
     * @param {string} access_token User bearer token.
     * {@link https://apidocs.pingidentity.com/pingone/platform/v1/api/#post-userinfo}
     */
    async userInfo(access_token) {
        console.info('Integration.PingOneUsers', 'Calling the User Info endpoint.');

        let myHeaders = new Headers();
        myHeaders.append('Authorization', 'Bearer ' + access_token);

        const requestOptions = {
            method: 'POST',
            headers: myHeaders,
            redirect: 'manual',
        };

        const url = this.p1Host + '/' + this.envId + '/as/userinfo';
        const rawResponse = await fetch(url, requestOptions);

        return rawResponse;
    }
}
export default PingOneUsers;
