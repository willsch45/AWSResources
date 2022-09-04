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
        try {
          //Potential query params (maxResults, pageToken, q (q is a customer query string which fits the gmail search format), labelIds[], includeSpamTrash)
          const { maxResults, pageToken, q, labelIds, includeSpamTrash } = event.queryStringParameters;
          const gmailL = authGmailLambda();

          // Split the query string into an array of words
          const labelArray = labelIds.split(",");

          body = await getGMailList(gmailL, maxResults, pageToken, q, labelArray, includeSpamTrash).catch(err => {
            statusCode = 500;
            body = 'Lambda processing error: ' + err;
          });
        } catch (error) {
          body = 'Error: ' + error;
          statusCode = 500;
        }
      
        break;

      case "GET /email/content": 
        try {

          //get the number of emails to generate
          const messageIDc = event.queryStringParameters.messageID; //Changed
            //body = messageID; things are good through this point

          //Authenticate with Google to get gmail variable, then get email Headers
          const gmailc = authGmailLambda();

          body = await getGMailContent(gmailc, messageIDc).catch(err => {
            body = 'Lambda processing error: ' + err;
            statusCode = 500;
          });

        } catch (error) {
          body = 'Error: ' + error;
          statusCode = 500;
        }

        break;
      
      case "GET /emailHeaders": 
        try {
          //get the number of emails to generate
          const messageIDh = event.queryStringParameters.messageID; //Changed
            //body = messageID; things are good through this point

          //Authenticate with Google to get gmail variable, then get email Headers
          const gmailh = authGmailLambda();

          body = await getGMailHeaders(gmailh, messageIDh).catch(err => {
            body = 'Lambda processing error: ' + err;
            statusCode = 500;
          });

        } catch (error) {
          body = 'Error: ' + error;
          statusCode = 500;
        }

        break;

      case "GET /emailSummary":
        try {
          const messageIDs = event.queryStringParameters.messageID;

          //1. Authenticate to get Gmail and OpenAI config variables
          const gmails = authGmailLambda();
          const openAIS = authOpenAILambda();

          //2.1 For each email in the array, get the email content
          const fullEmail = await getGMailContent(gmails, messageIDs).catch(err => {
            body = 'Lambda processing error, Gmail content: ' + err;
            statusCode = 500;
          });

          const prompt = convertEmailToSummaryInput(fullEmail);
          const completion = await getSummarization(openAIS, prompt).catch(err => {
            body = 'Lambda processing error, OpenAI: ' + err;
            statusCode = 500;
          });
          
          await dynamo
          .put({
            TableName: "etCetera_Completions",
            Item: {
              completionID: completion.openAIReturn.id,
              completion: completion,
            }
          })
          .promise();

          body = {
            email: fullEmail,
            prompt: prompt.prompt,
            completion: completion.completion
          }

        } catch (error) {
          body = 'Error: ' + error;
          statusCode = 500;
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
