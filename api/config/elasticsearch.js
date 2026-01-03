const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://127.0.0.1:9200',
  auth: {
    apiKey: process.env.ELASTICSEARCH_API_KEY
  }
});

module.exports = esClient;