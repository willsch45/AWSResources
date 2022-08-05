//require google from googleapis (External library)
const {google} = require('googleapis');

// Create new function to authenticate with Google
function authGmailLambda() {
    
    //Set creditals
    const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
    const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
    const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;
    const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI;

    //Create a new OAuth2 client and pass in the client_id, client_secret, and redirect_uri from .env
    const OAuth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    //Set credentials for the OAuth2 client
    OAuth2.setCredentials({refresh_token: REFRESH_TOKEN});

    //return gmail API instance
    return google.gmail({version: 'v1', auth: OAuth2});
}

//Export the function
module.exports = {authGmailLambda};