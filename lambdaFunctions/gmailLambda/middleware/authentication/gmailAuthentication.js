//require google from googleapis (External library)
const {google} = require('googleapis');
const { googleSecrets } = require("../../../../../secrets.js");

// Create new function to authenticate with Google
function authenticateGoogle() {

    const config = googleSecrets;

    //Set creditals
    const CLIENT_ID = config.CLIENT_ID;
    const CLIENT_SECRET = config.CLIENT_SECRET;
    const REFRESH_TOKEN = config.REFRESH_TOKEN;
    const REDIRECT_URI = config.REDIRECT_URI;

    //Create a new OAuth2 client and pass in the client_id, client_secret, and redirect_uri from .env
    const OAuth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    //Set credentials for the OAuth2 client
    OAuth2.setCredentials({refresh_token: REFRESH_TOKEN});

    //return gmail API instance
    return google.gmail({version: 'v1', auth: OAuth2});
}

//Export the function
module.exports = {authenticateGoogle};