const AWS = require("aws-sdk");
const { authenticateGoogle } = require("./middleware/authentication/gmailAuthentication");
const { authenticateOpenAI } = require("./middleware/authentication/openAIAuthentication"); 
// const { getGMailHeaders } = require("./middleware/emailFetchers/fetchGmailHeaders");
const { getGMailContent } = require("./middleware/emailFetchers/fetchGmailFullContent");
const { convertEmailToSummaryInput } = require("./middleware/summarization/preparationAndCleaning/emailPreparation");
const { getSummarization, costCalculator } = require("./middleware/summarization/summarizationEngine/summarizationEngine");

const exampleEmail = 
  {
    "id": "1824fd7318741b20",
    "threadID": "1824fd7318741b20",
    "from": "Rentmoola Operations <ops@rentmoola.com>",
    "to": "Rentmoola Operations <ops@rentmoola.com>",
    "date": "Sat, 30 Jul 2022 09:00:00 -0700",
    "subject": "Update Your Payment Method(s) on letus",
    "snippet": "Dear letus User, In keeping with standard maintenance procedures to protect your personal and payment information, we have reset payment methods saved in letus. If you have previously created payment",
    "labels": [
      "IMPORTANT",
      "CATEGORY_PERSONAL",
      "INBOX"
    ]
  }; 

function testSummary(){
 

  const gmail = authenticateGoogle();
  const openai = authenticateOpenAI();

  //print content from getGMailContent by passing through gmail and exampleEmail
  //then pass the result to the convertEmailToSummaryInput function
  //then pass to summarizeEmail function and print the result
  getGMailContent(gmail, exampleEmail).then(email => {
    const summaryInput = convertEmailToSummaryInput(email);
    getSummarization(openai, summaryInput).then(summary => {
      console.log(summary);
    }).catch(err => {
      console.log(err);
    }).finally(() => {
      console.log("Done");
      
    })

  });

  return ;
}

function testParseEmail(){
  const gmail = authenticateGoogle();

  getGMailContent(gmail, exampleMessagesArr).then(emails => {
    emails.forEach(email => {
      console.log(email);
    })
  })
}

testSummary();