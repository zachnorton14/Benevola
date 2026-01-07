import {FunctionTool, LlmAgent} from '@google/adk';
import {z} from 'zod';

/* Mock tool implementation */
const getAllEvents = new FunctionTool({
  name: 'get_all_events',
  description: 'Returns the list of all the events',
  execute: async () => {
    try {
      const response = await fetch('http://localhost:4000/api/events');
      if (!response.ok) {
        return { status: 'error', report: `Failed to fetch events: ${response.statusText}` };
      }
      const data = await response.json();
      return { status: 'success', report: JSON.stringify(data) };
    } catch (error) {
      return { status: 'error', report: `Error fetching events: ${error instanceof Error ? error.message : String(error)}` };
    }
  },
});

export const rootAgent = new LlmAgent({
  name: 'goodie_agent',
  model: 'gemini-3-flash-preview',
  description: 'Answer questions about available events',
  instruction: `You are a helpful assistant that provides the user with a list of all events.
                Use the 'getAllEvents' tool for this purpose.`,
  tools: [getAllEvents],
});