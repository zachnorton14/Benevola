const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'https://127.0.0.1:9200',
  auth: {
    username: process.env.ELASTIC_USERNAME,
    password: process.env.ELASTIC_PASSWORD
  },
  tls: {
    rejectUnauthorized: false // This stops the "other side closed" error if SSL is active
  }
});

module.exports = esClient;