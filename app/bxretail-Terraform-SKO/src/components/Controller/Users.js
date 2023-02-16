// Components
import PingOneUsers from '../Integration/PingOneUsers';
import Session from '../Utils/Session';

/**
 * Class representing the processing and fetching of user data.
 * This demo-specific class is developed and maintained by Ping Identity Technical Enablement.
 * Implements methods to process UI requests and data to send to Ping integration methods.
 * 
 * This is a modified version of what comes with the live BXRetail app. This component was
 * stripped down to only what was necessary for the Terraform labs.
 * 
 * @author Michael Sanchez, Technical Enablement
 */

class Users {
    /**
     * Class constructor
     */
    constructor() {
        this.envVars = window._env_;
        this.ping1Users = new PingOneUsers(this.envVars);
        this.session = new Session();
    }

    /**
     * Get User Info claims.
     * Receives raw data, if any, from the UI to be processed and passed to
     * integration method.
     *
     * {@link https://openid.net/specs/openid-connect-core-1_0.html#UserInfo}
     * {@link https://connect2id.com/products/server/docs/api/userinfo}
     *
     * @param {string} access_token User bearer token.
     */
    async getUserInfoClaims(access_token) {
        console.info('Controller.Users', 'Creating payload for the User Info endpoint call.');

        const rawResponse = await this.ping1Users.userInfo(access_token);
        const JSONresponse = await rawResponse.json();

        return JSONresponse;
    }

    /**
     * Read one user.
     * Receives raw data, if any, from the UI to be processed and passed to
     * integration method.
     */
    async readOneUser(userId, token) {
        const rawResponse = await this.ping1Users.readUser({ userId: userId, token: token });
        const JSONresponse = await rawResponse.json();
        return JSONresponse;
    }
}

export default Users;
