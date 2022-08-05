//The below code is almost verbatim from the following link: https://beta.openai.com/docs/api-reference/authentication
const { Configuration, OpenAIApi } = require("openai");

function authOpenAILambda() {

    const configuration = new Configuration({
        organization: process.env.OPENAI_apiKey,
        apiKey: process.env.OPENAI_organization	 //Changed from 'process.ENV.OPENAI_API_KEY' I will get this from the secrets manager in production
    });
    const openai = new OpenAIApi(configuration);

    return openai;
}

//export the function
module.exports = { authOpenAILambda };