//require google from googleapis and html-to-text
const {google} = require('googleapis');

//function to get a list of email IDs from the user's gmail account. Takes in a gmail object  for authentication and:
    // maxResults - Integer - The maximum number of results to return, 
    // pageToken - String - Page token to retrieve a specific page of results, 
    // q - String - q is a customer query string which fits the gmail search format
    // labelIds[] - Array[String] - Array of label IDs to search on
    // includeSpamTrash - Boolean - True if the search should include spam and trash

async function getGMailList(gmail, maxResults, pageToken, q, labelIds, includeSpamTrash) {
    try {
        //create a function that takes in the OAuth2 client and returns a list 5 of emails from the user's gmail account
        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: maxResults,
            pageToken: pageToken,
            q: q,
            labelIds: labelIds,
            includeSpamTrash: includeSpamTrash,
        });

        return response.data.messages;    
         
    } catch (err) {
        return err;
    }
}


//function to get a list of emails from the user's gmail account
async function getGMailHeaders(gmail, numEmails) {
    try {
        //create a function that takes in the OAuth2 client and returns a list 5 of emails from the user's gmail account
        const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: numEmails,
        });

        //create a variable to store the messages IDs & an array to store the emails
        const messagesIDs = response.data.messages.map(message => message.id); //map function does a for loop over the messages array and returns an array of IDs
        const messageDetails = [];

        //for loop through messagesIDs to get the email itself
        for (let i = 0; i < messagesIDs.length; i++) {
            try {
                //get emails from .get() function using Query parameters Format = METADATA and metadataHeaders = From,To,Date,Subject
                const message = await gmail.users.messages.get({
                    userId: 'me',
                    id: messagesIDs[i],
                    format: 'METADATA',
                    metadataHeaders: ['From','To','Date','Subject'], //If you wanted other email components you would add them to the metadataHeaders array
                });

                //Use deconstructSummary function to deconstruct the email. Add to emails array. No loop needed becuase you are already inside a loop
                messageDetails.push(deconstructToHeaders(message));
            } catch (err) {
                return err;
            }
        }
        
        return messageDetails;

    } catch (err) {
        return err;
    }


}

//Create a function to deconstruct the email into it's Headers (From, To, Date, Subject)
function deconstructToHeaders(email) {
    //create a variable to store the headers
    let headers = {
        id: '',
        threadID: '',
        from: '',
        to: '',
        date: '',
        subject: '',
        snippet: '',
        labels: []
    };
    
    //Add ids to the headers
    headers.id = email.data.id;
    headers.threadID = email.data.threadId;

    //Loop through the email.payload.headers array to get the headers
    //Use a switch statement to assign the headers to the correct variable
    for (let i = 0; i < email.data.payload.headers.length; i++) {
        switch (email.data.payload.headers[i].name) {
            case 'From':
                headers.from = email.data.payload.headers[i].value;
                break;
            case 'To':
                headers.to = email.data.payload.headers[i].value;
                break;
            case 'Date':
                headers.date = email.data.payload.headers[i].value;
                break;
            case 'Subject':
                headers.subject = email.data.payload.headers[i].value;
                break;
        }
    }

    //add snippet and labels to the headers. Replace all instances of the string '&#39;' in .snippet with '
    headers.snippet = email.data.snippet.replace(/&#39;/g, "'");;
    headers.labels = email.data.labelIds;

    return headers;
}

module.exports = {
    getGMailHeaders,
    getGMailList
};