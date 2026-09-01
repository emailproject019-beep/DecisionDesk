import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Note: In a real Next.js setup, this server logic would either run in a separate 
// Node.js process alongside Next, or via Next.js API Routes (Server-Sent Events).
// This serves as the definition for the specified 4 tools.

export function registerWebMCPTools(server: Server) {
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "get_decision",
        description: "Returns the current state of the decision matrix, including options, criteria, and calculated rankings.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "update_criterion_weight",
        description: "Updates the mathematical weight of a specific criterion.",
        inputSchema: {
          type: "object",
          properties: {
            criterionId: { type: "string" },
            weight: { type: "number", description: "Decimal between 0.0 and 1.0" }
          },
          required: ["criterionId", "weight"]
        }
      },
      {
        name: "set_constraint",
        description: "Marks a criterion as a hard constraint (e.g., must pass minimum score).",
        inputSchema: {
          type: "object",
          properties: {
            criterionId: { type: "string" },
            isConstraint: { type: "boolean" }
          },
          required: ["criterionId", "isConstraint"]
        }
      },
      {
        name: "run_scenario",
        description: "Applies a batch of weight changes simultaneously to see how rankings shift.",
        inputSchema: {
          type: "object",
          properties: {
            scenarioName: { type: "string" },
            weights: { 
              type: "object", 
              additionalProperties: { type: "number" } 
            }
          },
          required: ["scenarioName", "weights"]
        }
      }
    ]
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    // Execution logic will interact with your state layer / database here
    return { content: [{ type: "text", text: "Tool registered. Implementation pending integration." }] };
  });
}
