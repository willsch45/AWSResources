const AWS = require("aws-sdk");
const { authGmailLambda } = require('./middleware/authenticateLambda/gmailAuthLambda');
const { authOpenAILambda } = require("./middleware/authenticateLambda/openAIAuthLambda");
const { getGMailContent } = require("./middleware/emailFetchers/fetchGmailFullContent");
const { getGMailHeaders, getGMailList } = require("./middleware/emailFetchers/fetchGmailHeaders");
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
      
      case "GET /emailList":
        //PENDING implementation

        //Potential query params (maxResults, pageToken, q (q is a customer query string which fits the gmail search format), labelIds[], includeSpamTrash)
        const { maxResults, pageToken, q, labelIds, includeSpamTrash } = event.queryStringParameters;
        const gmailL = authGmailLambda();

        body = await getGMailList(gmailL, maxResults, pageToken, q, labelIds, includeSpamTrash).catch(err => {
          statusCode = 500;
          body = 'Lambda processing error: ' + err;
        });
      
        break;
      
      case "GET /emailHeaders": //Now this is timing out the function. Not sure what to make of that
          //get the number of emails to generate
          const numEmails = event.queryStringParameters.count;

          //Authenticate with Google to get gmail variable, then get email Headers
          const gmailH = authGmailLambda();

          body = await getGMailHeaders(gmailH, numEmails).catch(err => {
            body = 'Lambda processing error: ' + err;
            statusCode = 500;
          });

        break;

      case "POST /emailSummary":
        //The event payload is going to be an ID for a gmail message
          /* {
                // id: ''
          } */

          //Get event payload and save to a variable
          const eventPayload2 = JSON.parse(event.body);
          const receivedEmailID = eventPayload2.id;

          //1. Authenticate to get Gmail and OpenAI config variables
          const gmailS = authGmailLambda();
          const openAIS = authOpenAILambda();

          //2.1 For each email in the array, get the email content
          const fullEmail = await getGMailContent(gmailS, receivedEmailID).catch(err => {
            body = 'Lambda processing error, Gmail content: ' + err;
            statusCode = 500;
          });

          const prompt = convertEmailToSummaryInput(fullEmail);
          const completion = await getSummarization(openAIS, prompt).catch(err => {
            body = 'Lambda processing error, OpenAI: ' + err;
            statusCode = 500;
          });

          // Here is where we will save the prompt & completion to the database
            // TO DO!!! 

          body = {
            email: fullEmail,
            prompt: prompt.prompt,
            completion: completion.completion
          }
          
          break;

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
