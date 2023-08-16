## Docubot

This is a training-free, domain specific, chatbot powered by ChatGPT that consumes API specs to answer specific questions.

## How to run?

### Set environment variable

``OPEN_AI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXX``

### Configure chatbot

copy `config.template.json` into `config.json`. There you can configure:

- The prompt being used
- The question being asked
- The files to embed

### Build embeddings

`node src/build.js`

## Run

`node src/chat.js`
