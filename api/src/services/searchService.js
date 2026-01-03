const esClient = require('../../config/elasticsearch');

const INDEX_NAME = 'events';

const createIndex = async () => {
  try {
    const indexExists = await esClient.indices.exists({ index: INDEX_NAME });
    if (!indexExists) {
      await esClient.indices.create({
        index: INDEX_NAME,
        body: {
          mappings: {
            properties: {
              title: { type: 'text' },
              description: { type: 'text' },
              tags: { type: 'keyword' },
              date: { type: 'date' },
              latitude: { type: 'float' },
              longitude: { type: 'float' }
            }
          }
        }
      });
      console.log(`Index ${INDEX_NAME} created.`);
    }
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
        date: event.date,
        latitude: event.latitude,
        longitude: event.longitude,
        address: event.address
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
