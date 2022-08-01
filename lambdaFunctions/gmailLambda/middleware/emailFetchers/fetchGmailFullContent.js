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
        const messageIDs = messages.map(message => message.id); //map function does a for loop over the messages array and returns an array of IDs
        const emailContent = [];

        //A For loop to iterate through the messageIDs array
        for (let i = 0; i < messageIDs.length; i++) {
            //Try to get the email content from the gmail API
            try {
                //Get the email content for each messageID
                const gmResponse = await gmail.users.messages.get({
                    userId: 'me',
                    id: messageIDs[i],
                });

                emailContent.push(deconstructEmail(gmResponse, messages[i])); //also pass in the message object at this index to deconstructEmail
                
            } catch (err) {
                //If there is an error, return it and end the function
                return err;
            }
        }

        return emailContent;

    } catch (err) {
        return err;
    }
}

//Create a deconstructor function to place the email components into a JSON object for easy access. 
//Return the JSON object (email)
function deconstructEmail(gmResponse, message) {
    //create a JSON object to store two items for each email: the headers & the body text
        
    const email = {
        id: '',
        threadID: '',
        labels: [],
        snippet: '',
        headers: {
            from: '',
            to: '',
            date: '',
            subject: '',
        },
        bodyFull: {
            htmlText: '',
            plainText: '',
        },
        bodyAbbreviated: {
            sourceAbv: '',
            plainTextAbv: '',
        }
    };

    //Add the email identifiers and labels to the JSON object (id, threadID, labels) from message
    email.id = message.id;
    email.threadID = message.threadID;
    email.labels = message.labels;
    email.snippet = message.snippet;
    email.headers.from = message.from;
    email.headers.to = message.to;
    email.headers.date = message.date;
    email.headers.subject = message.subject;

    //dencode the Base64 body of the email (path 'message.data.payload.parts[1].body.data')
    //place into bodyFull object
    
    email.bodyFull.htmlText = decodeBody(gmResponse.data.payload.parts[1].body.data);
    email.bodyFull.plainText = decodeBody(gmResponse.data.payload.parts[0].body.data);

    //split bodyFull.htmlText on first instance of '<br>' and place first part into bodyAbbreviated.htmlTextabv 
    //convert from html and place in bodyAbbreviated.plainTextabv
    email.bodyAbbreviated.sourceAbv = email.bodyFull.htmlText.split('<div class="gmail_quote">')[0];
    email.bodyAbbreviated.plainTextAbv = convertHTMLBody(email.bodyAbbreviated.sourceAbv);

    //in .plainTextAbv, replace all instances of '\n' with ' '
    email.bodyAbbreviated.plainTextAbv = email.bodyAbbreviated.plainTextAbv.replace(/\n/g, ' ');

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
                { selector: 'img', format: 'skip' }
            ],
            wordwrap: false
        }).replace(/&#39;/g, "'")
    } catch (err) {
        plainText = 'Error decoding body: ' + err;
    }

    return plainText;
}

module.exports = {
    getGMailContent,
};