# DecisionDesk

DecisionDesk is a WebMCP-powered decision analysis workspace. It provides a transparent weighted-scoring engine that allows humans and AI agents to collaborate on structured decisions. Agents interact directly with the core logic via MCP tools to update assumptions, add criteria, and run scenarios.

## Setup

1. Install dependencies:
   `npm install`
2. Build the server:
   `npm run build`
3. Connect your MCP client (e.g., Claude Desktop) by configuring it to run:
   `node build/server.js`

## Exposed MCP Tools

* `get_decision_state`: View the current alternatives, criteria, and rankings.
* `add_alternative`: Add a new option to evaluate.
* `add_criterion`: Define a new scoring dimension and its weight.
* `set_score`: Assign a score (1-10) to an alternative for a specific criterion.
