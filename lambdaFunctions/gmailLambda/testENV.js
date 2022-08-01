const AWS = require("aws-sdk");
const { authenticateGoogle } = require("./middleware/authentication/gmailAuthentication");
const { authenticateOpenAI } = require("./middleware/authentication/openAIAuthentication"); 
// const { getGMailHeaders } = require("./middleware/emailFetchers/fetchGmailHeaders");
const { getGMailContent } = require("./middleware/emailFetchers/fetchGmailFullContent");
const { convertEmailToSummaryInput } = require("./middleware/summarization/preparationAndCleaning/emailPreparation");
const { getSummarization, costCalculator } = require("./middleware/summarization/summarizationEngine/summarizationEngine");

const exampleMessagesArr = [
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
  },
  {
    "id": "1824f18e7307342f",
    "threadID": "18247539c6a598e1",
    "from": "Justin Jensen <justin@orum.com>",
    "to": "William Schober <william@flanagan-schober.com>",
    "date": "Sat, 30 Jul 2022 06:33:17 -0600",
    "subject": "Re: Thanks for the conversation!",
    "snippet": "Totally cool, thank you! Justin Jensen Recruiter, Orum Cell: 323-608-3215 Follow me on LinkedIn On Sat, Jul 30, 2022 at 3:15 AM William Schober &lt;william@flanagan-schober.com&gt; wrote: Hey Justin, I",
    "labels": [
      "IMPORTANT",
      "CATEGORY_PERSONAL",
      "INBOX"
    ]
  },
  {
    "id": "1824e635484745b4",
    "threadID": "18247539c6a598e1",
    "from": "William Schober <william@flanagan-schober.com>",
    "to": "Justin Jensen <justin@orum.com>",
    "date": "Sat, 30 Jul 2022 16:15:10 +0700",
    "subject": "Re: Thanks for the conversation!",
    "snippet": "Hey Justin, I took a look at the review and I will be happy to provide feedback on it. That said, some of the form can only be filled out at the end of the process. If it's alright with you, I am",
    "labels": [
      "SENT"
    ]
  }
]; 

function testSummary(){
 

  const gmail = authenticateGoogle();
  const openai = authenticateOpenAI();
  let summaries = [];
  let aiOutput = {
    id: '',
    model: '',
    prompt: '',
    completion: '',
    usage: {  },
    cost: {  }
  };


  //print content from getGMailContent by passing through gmail and exampleMessagesArr using a then function
  //then pass the result to the convertEmailToSummaryInput function
  //then pass to summarizeEmail function
  getGMailContent(gmail, exampleMessagesArr).then(emails => {
    
    //loop through emails
    emails.forEach(email => {
      //convert email to string
      let promptString = convertEmailToSummaryInput(email);
      //summarize email
      getSummarization(openai, promptString).then(summary => {
        //add summary components to aiOutput object
        aiOutput.id = summary.id;
        aiOutput.model = summary.model;
        aiOutput.prompt = promptString
        aiOutput.completion = summary.choices[0].text;
        aiOutput.usage = summary.usage;
        aiOutput.cost = costCalculator(summary);

        //push aiOutput object to summaries array
        summaries.push(aiOutput);
      }).catch(err => {
        summaries = ['Error: ' + err];
      })
    })
  }).catch(err => {
    summaries = ['Error: Summarization error. Please notify support for assistance.']; // In the router THIS WON'T BE PRINTED
  });

  console.log(summaries);

  return summaries;
}

function testParseEmail(){
  const gmail = authenticateGoogle();

  getGMailContent(gmail, exampleMessagesArr).then(emails => {
    emails.forEach(email => {
      console.log(email);
    })
  })
}

console.log(testSummary());