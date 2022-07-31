import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
    organization: "org-IfQhw8oYUjTW8eW86UIPtEy8",
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
const response = await openai.listEngines();