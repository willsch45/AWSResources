//The below code is almost verbatim from the following link: https://beta.openai.com/docs/api-reference/authentication
const { Configuration, OpenAIApi } = require("openai");

function authOpenAILambda() {

    const configuration = new Configuration({
        organization: process.env.OPENAI_organization,
        apiKey: process.env.OPENAI_apiKey	 
    });
    const openai = new OpenAIApi(configuration);

    return openai;
}

//export the function
module.exports = { authOpenAILambda };