const AWS = require("aws-sdk");
const { authGmailLambda } = require('./middleware/authenticateLambda/gmailAuthLambda');
const { authOpenAILambda } = require("./middleware/authenticateLambda/openAIAuthLambda");
const { getGMailContent } = require("./middleware/emailFetchers/gmailFetchFullContent");
const { getGMailHeaders } = require("./middleware/emailFetchers/fetchGmailHeaders");
const { getSummarization } = require("./middleware/summarization/summarizationEngine/summarizationEngine");
const { convertEmailToSummaryInput } = require("./middleware/summarization/preparationAndCleaning/emailPreparation");

const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event, context) => {
  let body;
  let statusCode = 200;
  const headers = {
    "Content-Type": "application/json"
  };

  try {
    switch (event.routeKey) {
        case "GET /emailHeaders":
          //get the number of emails to generate
          let eventPayload = JSON.parse(event.body); //not sure about parse here.
          let numEmails = eventPayload.num; 

          //Authenticate with Google to get gmail variable, then get email Headers
          const gmailH = authGmailLambda();

          body = await getGMailHeaders(gmailH, numEmails).catch(err => {
            body = 'Lambda processing error: ' + err;
            statusCode = 500;
          });

        case 'GET /emailSummary':
          //The event payload is going to an array of email objects which, in turn, will have the following structure (tentatively!)
            /* {
                  // id: '',
                  // threadID: '',
                  // from: '',
                  // to: '',
                  // date: '',
                  // subject: '',
                  // snippet: '',
                  // labels: [] 
            } */

            //Get event payload and save to a variable
            let emailSet = JSON.parse(event.body);

            // Process flow FOR EACH email in the set:
              // 1. Authenticate with Google to get gmail variable, then authenticate with OpenAI to get openAI variable
              // 2. Create an array to hold: full emails, 
              // 3. Get the email content for each email in the email set (pass to fetchGmailFullContent) - IMPORTED
              // 4. Return the email content to a new variable (fullEmails) - ASYNC
              // 5. Prepare the email content for summarization (pass to convertEmailToSummaryInput) - IMPORTED
              // 6. Summarize the email content (pass to getSummarization) - IMPORTED
              // 7. Return the summary to a new variable (summaries) - ASYNC
              // 8. Push to emailSummaries array
                  // 9. Store the summary in DynamoDB - IMPORT --- DO THIS LATER
              // 10. Return the summary to the caller (body) - ASYNC, catch error and pass to body with statusCode 500 

            //1. Authenticate to get Gmail and OpenAI config variables
            const gmailS = authGmailLambda();
            const openAIS = authOpenAILambda();
            const emailSummaries = [];

            //For each email in emailSet, get the email content and summarize it
            for (let i = 0; i < emailSet.length; i++) {
              //2. Get the email content for each email in the email set (pass to fetchGmailFullContent)
              //3. Return the email content to a new variable (fullEmails) - ASYNC
              const fullEmail = await getGMailContent(gmailS, emailSet[i].id).catch(err => {
                body = 'Error retreiving full email: ' + err;
                statusCode = 500;
              }).then(fullEmail => {
                //4. Prepare the email content for summarization (pass to convertEmailToSummaryInput)
                const emailSummary = convertEmailToSummaryInput(fullEmail);

                //5. Summarize the email content (pass to getSummarization)
                const summary = await getSummarization(openAIS, emailSummary).catch(err => {
                  body = 'Error summarizing email: ' + err;
                  statusCode = 500;
                }).then(summary => {
                  // 8. Push to emailSummaries array
                  emailSummaries.push(summary);
                });
              });
            }

            

      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    statusCode = 400;
    body = err.message;
  } finally {
    body = JSON.stringify(body); //not sure that I want to convert to a string here
  }

  return {
    statusCode,
    body,
    headers
  };
};
