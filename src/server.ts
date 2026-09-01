import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { DecisionEngine } from "./engine.js";

const engine = new DecisionEngine();
const server = new Server({ name: "DecisionDesk", version: "1.0.0" }, { capabilities: { tools: {} } });

// Expose tools to the AI agent
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_decision_state",
      description: "Get the current state of the decision matrix and calculated rankings.",
      inputSchema: { type: "object", properties: {} }
    },
    {
      name: "add_alternative",
      description: "Add a new option to evaluate.",
      inputSchema: {
        type: "object",
        properties: { name: { type: "string" }, description: { type: "string" } },
        required: ["name"]
      }
    },
    {
      name: "add_criterion",
      description: "Add a new criterion with a weight (e.g., 0.0 to 1.0) for scoring alternatives.",
      inputSchema: {
        type: "object",
        properties: { name: { type: "string" }, weight: { type: "number" } },
        required: ["name", "weight"]
      }
    },
    {
      name: "set_score",
      description: "Score an alternative against a criterion (typically 1-10).",
      inputSchema: {
        type: "object",
        properties: { altId: { type: "string" }, critId: { type: "string" }, value: { type: "number" } },
        required: ["altId", "critId", "value"]
      }
    }
  ]
}));

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "get_decision_state") {
      return { content: [{ type: "text", text: JSON.stringify(engine.getState(), null, 2) }] };
    }
    
    if (name === "add_alternative") {
      const id = engine.addAlternative(String(args?.name), args?.description ? String(args.description) : undefined);
      return { content: [{ type: "text", text: `Added alternative with ID: ${id}` }] };
    }

    if (name === "add_criterion") {
      const id = engine.addCriterion(String(args?.name), Number(args?.weight));
      return { content: [{ type: "text", text: `Added criterion with ID: ${id}` }] };
    }

    if (name === "set_score") {
      engine.setScore(String(args?.altId), String(args?.critId), Number(args?.value));
      return { content: [{ type: "text", text: "Score updated successfully. Call get_decision_state to see new rankings." }] };
    }

    throw new Error(`Tool not found: ${name}`);
  } catch (error: any) {
    return { content: [{ type: "text", text: `Error: ${error.message}` }], isError: true };
  }
});

// Start the MCP Server via standard I/O
const transport = new StdioServerTransport();
await server.connect(transport);
