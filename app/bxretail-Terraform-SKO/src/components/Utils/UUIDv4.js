/**
 * Functional component that implements utility functions.
 * Forgot where I got this from.
 * 
 * @author Michael Sanchez
*/

/**
 * Generates a UUID.
 *
 * @return {String} A UUID.
*/
export const uuidv4 = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        // eslint-disable-next-line no-mixed-operators
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}