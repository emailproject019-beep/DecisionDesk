import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { updateWeightTool, handleUpdateWeight } from "./update-weight";
import { scoreOptionTool, handleScoreOption } from "./score-option";
import { getDecisionTool, handleGetDecision } from "./get-decision";

export function registerWebMCPTools(server: Server, store: any) {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      getDecisionTool,
      updateWeightTool,
      scoreOptionTool
      // Add other tools like set-constraint, run-scenario here
    ]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "get_decision":
          return handleGetDecision(store);
        case "update_weight":
          return handleUpdateWeight(store, args);
        case "score_option":
          return handleScoreOption(store, args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error: any) {
      return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
    }
  });
}
