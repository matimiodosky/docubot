const {Embedder} = require('./embedder')
const config = require('../config.json')

const embedder = new Embedder()

console.log('calculating embeddings')

embedder
    .calculateEmbeddings(config.apiSpecs, '../embeddings.json', '../chunks.json')
    .then(() => console.log('embeddings completed'))