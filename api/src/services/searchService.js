const esClient = require('../../config/elasticsearch');

const INDEX_NAME = 'events';

const createIndex = async () => {
  try {
    const indexExists = await esClient.indices.exists({ index: INDEX_NAME });
    if (indexExists) {
      // We must delete the index to apply mapping changes
      await esClient.indices.delete({ index: INDEX_NAME });
      console.log(`Old index ${INDEX_NAME} deleted.`);
    }

    await esClient.indices.create({
      index: INDEX_NAME,
      body: {
        settings: {
          analysis: {
            filter: {
              autocomplete_filter: {
                type: "edge_ngram",
                min_gram: 1,
                max_gram: 20
              }
            },
            analyzer: {
              autocomplete: {
                type: "custom",
                tokenizer: "standard",
                filter: ["lowercase", "autocomplete_filter"]
              },
              autocomplete_search: {
                type: "custom",
                tokenizer: "standard",
                filter: ["lowercase"]
              }
            }
          }
        },
        mappings: {
          properties: {
            title: { 
              type: 'text', 
              analyzer: "autocomplete", 
              search_analyzer: "autocomplete_search" 
            },
            description: { 
              type: 'text', 
              analyzer: "autocomplete", 
              search_analyzer: "autocomplete_search" 
            },
            tags: { type: 'keyword' },
            date: { type: 'date' },
            latitude: { type: 'float' },
            longitude: { type: 'float' }
          }
        }
      }
    });
    console.log(`Index ${INDEX_NAME} created with autocomplete.`);
  } catch (error) {
    console.error('Error creating index:', error);
  }
};

const indexEvent = async (event) => {
  try {
    await esClient.index({
      index: INDEX_NAME,
      id: event.id.toString(),
      body: {
        title: event.title,
        description: event.description,
        tags: event.tags ? event.tags.split(',') : [],
      }
    });
  } catch (error) {
    console.error(`Error indexing event ${event.id}:`, error);
  }
};

const searchEvents = async (query) => {
  try {
    const result = await esClient.search({
      index: INDEX_NAME,
      body: {
        query: {
          multi_match: {
            query: query,
            fields: ['title', 'description', 'tags', 'address'],
            fuzziness: 'AUTO'
            // fuzziness: 5
          }
        }
      }
    });
    return result.hits.hits.map(hit => ({ id: hit._id, ...hit._source, score: hit._score }));
  } catch (error) {
    console.error('Error searching events:', error);
    throw error;
  }
};

const removeEvent = async (eventId) => {
  try {
    await esClient.delete({
      index: INDEX_NAME,
      id: eventId.toString()
    });
  } catch (error) {
    console.error(`Error removing event ${eventId}:`, error);
  }
};

module.exports = {
  createIndex,
  indexEvent,
  searchEvents,
  removeEvent
};
