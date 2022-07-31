//require google from googleapis (External library)
const {google} = require('googleapis');

// Create new function to authenticate with Google
function authenticateGoogle() {

    //Set creditals
    const CLIENT_ID = '90951196590-uijil7r82f1eg9berst8jgnrs8kld83c.apps.googleusercontent.com';
    const CLIENT_SECRET = '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';
    const REFRESH_TOKEN = '1//04Pb3hxMvIlZuCgYIARAAGAQSNwF-L9Irx2XWhs4dOm8YpFp8mcNSXInefHrPUmwydpQyDxQu69Bdy_KZOsRgYYS11H1ZEkwmCo4';
    const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

    //Create a new OAuth2 client and pass in the client_id, client_secret, and redirect_uri from .env
    const OAuth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

    //Set credentials for the OAuth2 client
    OAuth2.setCredentials({refresh_token: REFRESH_TOKEN});

    //return gmail API instance
    return google.gmail({version: 'v1', auth: OAuth2});
}

//Export the function
module.exports = {authenticateGoogle};