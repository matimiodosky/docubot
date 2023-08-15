## How to run?

### Set environment variable

``OPEN_AI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXX``

### Configure chatbot

copy `config.template.json` into `config.json`. There you can configure:

- The prompt being used
- The question being asked
- The files to embed

### Build embeddings

`node build.js`

## Run

`node chat.js`