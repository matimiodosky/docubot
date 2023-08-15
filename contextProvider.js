const {Embedder} = require('./embedder')

const math = require('mathjs');

class ContextProvider {

    constructor(embeddingsPath, chunksPath, contextSize = 10) {
        this.embeddingsPath = embeddingsPath
        this.chunksPath = chunksPath
        this.embeddings = require(embeddingsPath);
        this.chunks = require(chunksPath);
        this.contextSize = contextSize
    }

    cosineSimilarity = (vecA, vecB) => {
        const dotProduct = math.dot(vecA, vecB);
        const vecANorm = math.norm(vecA);
        const vecBNorm = math.norm(vecB);

        return dotProduct / (vecANorm * vecBNorm);
    };

    getTopClosestEmbeddings = (targetEmbedding) => {
        // Compute the cosine distance for each embedding in the object
        const distances = [];

        for (let key in this.embeddings) {
            const similarity = this.cosineSimilarity(targetEmbedding, this.embeddings[key]);
            const distance = 1 - similarity;
            distances.push({key, distance});
        }

        // Sort by distance (ascending)
        distances.sort((a, b) => a.distance - b.distance);

        // Return the top 10
        return distances.slice(0, this.contextSize).map(item => item.key);
    };

    async selectContext(question) {

        const embedder = new Embedder()
        const embedding = await embedder.calculateEmbedding(question)

        const closestHashes = this.getTopClosestEmbeddings(embedding)
        const closestChunks = []
        for (let closestHash of closestHashes) {
            closestChunks.push(this.chunks[closestHash])
        }
        return closestChunks
            .map(obj => {
                delete obj.type
                return obj
            })
    }
}

const run = async () => {
    const contextProvider = new ContextProvider(
        './embeddings.json',
        './chunks.json',
        10
    )

    const chunks = await contextProvider.selectContext('I want to get flag data, which API I should use? How to write a java code to consume it?')

    console.log(JSON.stringify(chunks))
}

// run()

module.exports = {ContextProvider}