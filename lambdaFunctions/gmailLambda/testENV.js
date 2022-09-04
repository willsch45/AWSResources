const AWS = require("aws-sdk");
const { authenticateGoogle } = require("./middleware/authentication/gmailAuthentication");
const { authenticateOpenAI } = require("./middleware/authentication/openAIAuthentication"); 
const { getGMailHeaders } = require("./middleware/emailFetchers/fetchGmailHeaders");
const { getGMailContent } = require("./middleware/emailFetchers/fetchGmailFullContent");
const { convertEmailToSummaryInput } = require("./middleware/summarization/preparationAndCleaning/emailPreparation");
const { getSummarization, costCalculator } = require("./middleware/summarization/summarizationEngine/summarizationEngine");

const exampleEmails = ['182d59081f604a61', '18241afe2deec277', '182d75928e7ecaa8'];

// function testHeaders(){
 

//   const gmail = authenticateGoogle();

//   const messageID = exampleEmail;

//   getGMailHeaders(gmail, messageID).then(data => {
//     console.log(data);
//   }).catch(err => {
//     console.log('Lambda processing error: ' + err);
//   });
// }

function testContent(){
  //Authenticate with Google to get gmail variable, then get email Headers
  const gmail = authenticateGoogle();

  //Loop through the example emails and get the content for each one using getGmailContent function
  getGMailContent(gmail, exampleEmails[0]).then(data => {
    console.log(data.bodyAbbreviated.plainTextAbv);
  }).catch(err => {
    console.log('Error at email 1: ' + err);
  });

  getGMailContent(gmail, exampleEmails[1]).then(data => {
    console.log(data.bodyAbbreviated.plainTextAbv);
  }).catch(err => {
    console.log('Error at email 2: ' + err);
  });

  getGMailContent(gmail, exampleEmails[2]).then(data => {
    console.log(data.bodyAbbreviated.plainTextAbv);
  }).catch(err => {
    console.log('Error at email 3: ' + err);
  });
}

testContent();