const AWS = require("aws-sdk");
const { authenticateGoogle } = require("./middleware/authentication/gmailAuthentication");
const { getGMailHeaders } = require("./middleware/emailFetchers/fetchGmailHeaders");

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
          const gmail = authenticateGoogle();

          body = await getGMailHeaders(gmail, numEmails).catch(err => {
            body = 'Lambda processing error: ' + err;
            statusCode = 500;
          });

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
