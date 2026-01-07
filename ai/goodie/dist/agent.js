"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootAgent = void 0;
const adk_1 = require("@google/adk");
/* Mock tool implementation */
const getAllEvents = new adk_1.FunctionTool({
    name: 'get_all_events',
    description: 'Returns the list of all the events',
    execute: () => {
        return { status: 'success', report: `Event 1, Event 2, Event 3` };
    },
});
exports.rootAgent = new adk_1.LlmAgent({
    name: 'goodie_agent',
    model: 'gemini-2.5-flash',
    description: 'Answer questions about available events',
    instruction: `You are a helpful assistant that provides the user with a list of all events.
                Use the 'getAllEvents' tool for this purpose.`,
    tools: [getAllEvents],
});
