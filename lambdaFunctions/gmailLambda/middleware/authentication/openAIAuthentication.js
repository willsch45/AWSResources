//The below code is almost verbatim from the following link: https://beta.openai.com/docs/api-reference/authentication
const { Configuration, OpenAIApi } = require("openai");
const { openAISecrets } = require("../../../../../secrets.js");

function authenticateOpenAI() {
    const config = openAISecrets;

    const configuration = new Configuration({
        organization: config.organization,
        apiKey: config.apiKey //Changed from 'process.ENV.OPENAI_API_KEY' I will get this from the secrets manager in production
    });
    const openai = new OpenAIApi(configuration);

    return openai;
}

//export the function
module.exports = { authenticateOpenAI };