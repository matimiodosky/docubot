const yaml = require('js-yaml');
const fs = require('fs');
const crypto = require('crypto');
const {Configuration, OpenAIApi} = require("openai");


class Embedder {

    constructor() {
        const configuration = new Configuration({
            apiKey: process.env.OPEN_AI_API_KEY
        });
        this.openai = new OpenAIApi(configuration);
    }

    getSpec = async (path) =>
        yaml.load(fs.readFileSync(path, 'utf8'));

    generateHash = data => {
        const hash = crypto.createHash('sha256');
        hash.update(JSON.stringify(data));
        return hash.digest('hex');
    };

    splitDescriptionIntoChunks = description => {
        // Splitting by paragraphs or new lines. You can modify this to split by sentences if needed.
        return description.split("##").map(paragraph => paragraph.trim()).filter(paragraph => paragraph);
    };


    splitSpec = (spec) => {
        const chunks = [];

        for (const path in spec.paths) {
            const endpoint = spec.paths[path];

            // Add details of the endpoint as a chunk
            chunks.push({
                type: 'endpoint',
                path: path,
                endpoint
            });
        }

        // Split description and add each part as a separate chunk
        const descriptionChunks = this.splitDescriptionIntoChunks(spec.info.description);
        descriptionChunks.forEach(descriptionChunk => {
            chunks.push({
                type: 'description',
                content: descriptionChunk
            });
        });

        return chunks;
    }

    readOrCalculateEmbedding = async (embeddings, hash, chunk) => {
        if (embeddings[hash]) {
            return embeddings[hash]
        } else {
            const embedding = await this.calculateEmbedding(chunk)
            embeddings[hash] = embedding
            return embedding
        }
    }

    calculateEmbedding = async (chunk) => {
        const response = await this.openai.createEmbedding({
            model: "text-embedding-ada-002",
            input: JSON.stringify(chunk),
        });

        return response.data.data[0].embedding
    }

    calculateEmbeddings = async (specsPaths, embeddingsPath, chunksPath) => {
        let embeddings
        try {
            embeddings = require(embeddingsPath) || {}
        } catch (e) {
            embeddings = {}
        }
        let hashedChunks = {}
        for (let documentationPath of specsPaths) {
            const spec = await this.getSpec(documentationPath);
            const chunks = this.splitSpec(spec);
            hashedChunks = {...hashedChunks, ...this.hashChunks(chunks)}
        }
        fs.writeFileSync(chunksPath, JSON.stringify(hashedChunks))
        let i = 0
        for (let [hash, chunk] of Object.entries(hashedChunks)) {
            console.log('calculating embedding ' + i++ + ' of ' + (Object.entries(hashedChunks).length - 1))
            await this.readOrCalculateEmbedding(embeddings, hash, chunk)
        }
        // update embeddings file
        fs.writeFileSync(embeddingsPath, JSON.stringify(embeddings))
        return this.embeddings
    }

    hashChunks(chunks) {
        const hashedChunks = {}
        for (let chunk of chunks) {
            const hash = this.generateHash(chunk)
            hashedChunks[hash] = chunk
        }
        return hashedChunks
    }
}

const run = async () => {
    const embedder = new Embedder()
    await embedder.calculateEmbeddings(
        ['docs/swaggerhub/apiservice.v1.yaml', 'docs/swaggerhub/apiservice.v2.yaml'],
        './embeddings.json',
        './chunks.json'
    )
}

// run()


module.exports = {Embedder}
