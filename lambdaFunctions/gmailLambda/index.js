const AWS = require("aws-sdk");
const { authGmailLambda } = require('./middleware/authenticateLambda/gmailAuthLambda');
const { authOpenAILambda } = require("./middleware/authenticateLambda/openAIAuthLambda");
const { getGMailContent } = require("./middleware/emailFetchers/fetchGmailFullContent");
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
        case "GET /emailHeaders": //Now this is timing out the function. Not sure what to make of that
          //get the number of emails to generate
          const eventPayload1 = JSON.parse(event.body); //not sure about parse here.
          const numEmails = eventPayload1.num; 

          //Authenticate with Google to get gmail variable, then get email Headers
          const gmailH = authGmailLambda();

          body = await getGMailHeaders(gmailH, numEmails).catch(err => {
            body = 'Lambda processing error: ' + err;
            statusCode = 500;
          });

          break;

        case "GET /emailSummary":
          //The event payload is going to be an email objects which, in turn, will have the following structure (tentatively!)
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
            const eventPayload2 = JSON.parse(event.body);
            const receivedEmail = eventPayload2.email;

            //1. Authenticate to get Gmail and OpenAI config variables
            const gmailS = authGmailLambda();
            const openAIS = authOpenAILambda();

            //2.1 For each email in the array, get the email content
            const fullEmail = await getGMailContent(gmailS, receivedEmail).catch(err => {
              body = 'Lambda processing error, Gmail content: ' + err;
              statusCode = 500;
            });

            const prompt = convertEmailToSummaryInput(fullEmail);
            const completion = await getSummarization(openAIS, prompt).catch(err => {
              body = 'Lambda processing error, OpenAI: ' + err;
              statusCode = 500;
            });

            body = {
              prompt: prompt,
              competion: completion
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
