//require google from googleapis and html-to-text
//const { response } = require('express');
const {google} = require('googleapis');
const { convert } = require('html-to-text');


//Async function to get the email summary
//Takes as inputs a gmail object (oauth2 client) and an array of message detail objects containing
    // id: '',
    // threadID: '',
    // from: '',
    // to: '',
    // date: '',
    // subject: '',
    // snippet: '',
    // labels: [] 

async function getGMailContent(gmail, messages) {
    //Try to get the emails from the user's gmail account
    try {
        //create a variable to store the messages IDs from messages & an array to store the emails
        

        const messageIDs = response.data.messages.map(message => message.id); //map function does a for loop over the messages array and returns an array of IDs
        let emailContent = [];

        //A For loop to iterate through the messageIDs array
        for (let i = 0; i < messageIDs.length; i++) {
            //Try to get the email content from the gmail API
            try {
                //Get the email content for each messageID
                const response = await gmail.users.messages.get({
                    userId: 'me',
                    id: messageIDs[i],
                });

                emailContent.push(deconstructEmail(response));

            } catch (err) {
                //If there is an error, return it and end the function
                return err;
            }

            //Deconstruct the email content using the deconstructEmail function
            //emailContent.push(deconstructEmail(message));
        }

        return emailContent;

    } catch (err) {
        return err;
    }
}



//function to get a list of emails from the user's gmail account
async function getMailSummary() {
    //create a new gmail object
    const gmail = google.gmail({version: 'v1', auth: OAuth2});

    //create a function that takes in the OAuth2 client and returns a list 5 of emails from the user's gmail account
    const response = await gmail.users.messages.list({
        userId: 'me',
        maxResults: 5,
    });

    //create a variable to store the messages IDs & an array to store the emails
    const messagesIDs = response.data.messages.map(message => message.id); //map function does a for loop over the messages array and returns an array of IDs
    const messageDetails = [];

    //for loop through messagesIDs to get the email itself
    for (let i = 0; i < messagesIDs.length; i++) {

        //get emails from .get() function using Query parameters Format = METADATA and metadataHeaders = From,To,Date,Subject
        const message = await gmail.users.messages.get({
            userId: 'me',
            id: messagesIDs[i],
            format: 'METADATA',
            metadataHeaders: ['From','To','Date','Subject'], //If you wanted other email components you would add them to the metadataHeaders array
        });
        
        //Use deconstructSummary function to deconstruct the email. Add to emails array. No loop needed becuase you are already inside a loop
        messageDetails.push(message.data);
    }
    
    return messageDetails;
}

//Create a deconstructor function to place the email components into a JSON object for easy access. 
//Return the JSON object (email)
function deconstructEmail(message) {
    //create a JSON object to store two items for each email: the headers & the body text
    const email = {
        id: '',
        threadID: '',
        labels: [],
        headers: {
            From: '',
            To: '',
            Date: '',
            Subject: '',
        },
        bodyFull: {
            htmlText: '',
            plainText: '',
        },
        bodyAbbreviated: {
            htmlTextAbv: '',
            plainTextAbv: '',
        }
    };

    //Add the email identifiers and labels to the JSON object (id, threadID, labels)
    email.id = message.data.id;
    email.threadID = message.data.threadId;
    email.labels = message.data.labelIds;


    //for loop through the 'header' array in the message object
    //THIS IS HUGELY INEFFICIENT. You already have this data.
    for (let j = 0; j < message.data.payload.headers.length; j++) {

        //Sort the headers into the email object
        switch (message.data.payload.headers[j].name) {
            case 'From':
                email.headers.From = message.data.payload.headers[j].value;
                break;
            case 'To':
                email.headers.To = message.data.payload.headers[j].value;
                break;
            case 'Date':
                email.headers.Date = message.data.payload.headers[j].value;
                break;
            case 'Subject':
                email.headers.Subject = message.data.payload.headers[j].value;
                break;
            default:
                break;
        }
    }

    //dencode the Base64 body of the email (path 'message.data.payload.parts[1].body.data')
    //place into bodyFull object
    email.bodyFull.htmlText = decodeBody(message.data.payload.parts[1].body.data);
    email.bodyFull.plainText = convertHTMLBody(email.bodyFull.htmlText);

    //split bodyFull.htmlText on first instance of '<br>' and place first part into bodyAbbreviated.htmlTextabv 
    //convert from html and place in bodyAbbreviated.plainTextabv
    email.bodyAbbreviated.htmlTextAbv = email.bodyFull.htmlText.split('<br>')[0];
    email.bodyAbbreviated.plainTextAbv = convertHTMLBody(email.bodyAbbreviated.htmlTextAbv);

    return email;
}

//Create a function that decodes the email body from base64 to UFT-8 text
function decodeBody(body) {
    let decodedBody = '';

    try {
        //decode the body from base64 to UFT-8 text
        decodedBody = Buffer.from(body, 'base64').toString('utf8');
    } catch (err) {
        decodedBody = 'Error decoding body: ' + err;
    }

    return decodedBody;
}

//Create a function to convert the email body from HTML to plain text
function convertHTMLBody(html) {
    let plainText = '';

    try {
        plainText = convert(html, {
            selectors: [
                { selector: '*', format: 'skip' }
            ],
            wordwrap: false
        });
    } catch (err) {
        plainText = 'Error decoding body: ' + err;
    }

    return plainText;
}

module.exports = {
    getGMailContent,
};