const { Client } = require('@elastic/elasticsearch');

const esClient = new Client({
  node: process.env.ELASTICSEARCH_NODE || 'http://127.0.0.1:9200',
  auth: {
    username: 'elastic',
    password: 'EWTvwxrtVQ6=UdqgISml'
  },
  tls: {
    rejectUnauthorized: false // This stops the "other side closed" error if SSL is active
  }
});

module.exports = esClient;