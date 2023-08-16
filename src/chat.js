const {ContextProvider} = require('./contextProvider')
const {Configuration, OpenAIApi} = require("openai");
const config = require('../config.json')
class Chat {

    constructor() {
        this.contextProvider = new ContextProvider('../embeddings.json', '../chunks.json', 8)
        const configuration = new Configuration({
            apiKey: process.env.OPEN_AI_API_KEY
        });
        this.openai = new OpenAIApi(configuration);
    }

    question = async question => {

        console.log('getting context')
        const context = await this.contextProvider.selectContext(question)
        console.log('getting context... done')
        console.log('getting answer')
        const answer  = await this.openai.createChatCompletion({
            model: "gpt-3.5-turbo-16k",
            messages: [
                {
                    "role": "system",
                    "content": config.prompt
                },
                {
                    "role": "user",
                    "content": JSON.stringify(context) + " " + question
                }
            ]
        })

        const response = answer.data.choices[0].message.content

        console.log('Response: ' + response)

        return response
    };


}

const run = async () => {
    const chat = new Chat()

    await chat.question(config.question)
}

// run()

module.exports = {Chat}