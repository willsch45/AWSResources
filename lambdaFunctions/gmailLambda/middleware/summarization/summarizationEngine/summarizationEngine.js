const { Configuration, OpenAIApi } = require("openai");

//An async function that takes prepared strings as inputs:
    //openai: OpenAi configuration object
    //stringToSummarize: the string to summarize



//The function will return JSON object with the following properties:
    //  {
    //     "id": "cmpl-uqkvlQyYK7bGYrRHQ0eXlWi7",
    //     "object": "text_completion",
    //     "created": 1589478378,
    //     "model": "text-davinci-002",
    //     "choices": [
    //       {
    //         "text": <returned text>
    //         "index": 0,
    //         "logprobs": null,
    //         "finish_reason": "length"
    //       }
    //     ],
    //     "usage": {
    //       "prompt_tokens": 5,
    //       "completion_tokens": 6,
    //       "total_tokens": 11
    //     }
    //   }

async function getSummarization(openai, stringToSummarize) {
    const response = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: stringToSummarize,
        max_tokens: 300, //using davinci model with 300 tokens will result in a maximum charge for response of $0.018 (1.8 cents)
        temperature: 1,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

    return response.data;
}

//Cost of summarization
function costCalculator(openAISummary) {
    let cost = {
        promptCost: 0,
        completionCost: 0,
        totalCost: 0
    }

    //Create a switch statement using openAISummary.model
    //The switch statement will return the cost of each part of openAISummary.usage (prompt_token, completion_token, total_token)
        // text-ada-001 cost = $0.0008 / 1,000 tokens = $0.0000008 per token
        // text-babbage-001 cost = $0.0012 / 1,000 tokens = $0.000012 per token
        // text-curie-001 cost = $0.0060 / 1K tokens = $0.000006 per token
        // text-davinci-002 cost = $0.0600 / 1K tokens = $0.00006 per token
    
    switch (openAISummary.model) {
        case "text-ada-001":
            cost.promptCost = 0.0000008 * openAISummary.usage.prompt_tokens;
            cost.completionCost = 0.0000008 * openAISummary.usage.completion_tokens;
            cost.totalCost = cost.promptCost + cost.completionCost;
            break;
        case "text-babbage-001":
            cost.promptCost = 0.0000012 * openAISummary.usage.prompt_tokens;
            cost.completionCost = 0.0000012 * openAISummary.usage.completion_tokens;
            cost.totalCost = cost.promptCost + cost.completionCost;
            break;
        case "text-curie-001":
            cost.promptCost = 0.000006 * openAISummary.usage.prompt_tokens;
            cost.completionCost = 0.000006 * openAISummary.usage.completion_tokens;
            cost.totalCost = cost.promptCost + cost.completionCost;
            break;
        case "text-davinci-002":
            cost.promptCost = 0.00006 * openAISummary.usage.prompt_tokens;
            cost.completionCost = 0.00006 * openAISummary.usage.completion_tokens;
            cost.totalCost = cost.promptCost + cost.completionCost;
            break;
        default:
            cost.promptCost = 0;
            cost.completionCost = 0;
            cost.totalCost = 0;
            break;
    }

    return cost;
}

module.exports = {
    getSummarization,
    costCalculator
}