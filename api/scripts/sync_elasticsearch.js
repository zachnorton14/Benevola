require("dotenv").config({ quiet: true });
const sequelize = require('../src/db/database.js');
const Event = require('../src/models/Event');
const { createIndex, indexEvent } = require('../src/services/searchService');

const syncEvents = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    await createIndex();

    const events = await Event.findAll();
    console.log(`Found ${events.length} events to index.`);

    for (const event of events) {
      await indexEvent(event);
    }

    console.log('Indexing complete.');
  } catch (error) {
    console.error('Error syncing events:', error);
  } finally {
    await sequelize.close();
  }
};

syncEvents();