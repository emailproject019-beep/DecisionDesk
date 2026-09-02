# DecisionDesk

A **WebMCP-powered decision analysis workspace** built with Next.js and a browser-based MCP client. DecisionDesk enables transparent, structured decision-making where humans and AI agents collaborate through four core tools backed by a Zustand-managed decision engine.

## What DecisionDesk Does

DecisionDesk provides a **weighted-scoring decision framework** that:
- Allows users to define multiple alternatives and evaluation criteria
- Enables weighted scoring across dimensions for systematic comparison
- Exposes decision state to AI agents via WebMCP
- Maintains a complete audit trail of decisions and scores
- Bridges human expertise with AI reasoning in a transparent workflow

Perfect for:
- Technical decisions (architecture choices, vendor evaluation)
- Strategic planning (roadmap prioritization, feature selection)
- Resource allocation (team assignments, budget decisions)
- Product decisions (feature trade-offs, market positioning)

## How WebMCP is Used

DecisionDesk runs a **Model Context Protocol (MCP) server** directly in the browser using a custom transport layer:

```
Browser (Next.js) ← WebMCP → MCP Server ← Tools → Zustand Store
```

The browser-based MCP implementation:
1. **Serializes** the decision state into the MCP schema
2. **Exposes** four core tools that agents can invoke
3. **Processes** tool calls from Claude or other MCP-compatible clients
4. **Updates** the Zustand store and UI reactively

This eliminates the need for external servers while maintaining full MCP protocol compliance.

## Core Tools

DecisionDesk exposes four MCP tools for agent interaction:

### 1. `get_decision_state`
Retrieve the complete decision context: all alternatives, criteria, weights, and current scores.

**Response:**
```json
{
  "alternatives": ["Option A", "Option B", ...],
  "criteria": [
    { "name": "Cost", "weight": 30 },
    { "name": "Performance", "weight": 40 },
    { "name": "Team Skills", "weight": 30 }
  ],
  "scores": {
    "Option A": { "Cost": 8, "Performance": 7, "Team Skills": 9 },
    "Option B": { "Cost": 6, "Performance": 9, "Team Skills": 6 }
  }
}
```

### 2. `add_alternative`
Add a new option to the decision matrix.

**Parameters:**
- `name` (string): The alternative's name

### 3. `add_criterion`
Define a new scoring dimension and assign its relative weight.

**Parameters:**
- `name` (string): The criterion name (e.g., "Cost", "Performance")
- `weight` (number): Relative weight (typically 1-100, auto-normalized)

### 4. `set_score`
Assign a numeric score (1-10) to an alternative for a specific criterion.

**Parameters:**
- `alternative` (string): The alternative being evaluated
- `criterion` (string): The scoring dimension
- `score` (number): Score from 1-10

---

## Local Setup

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/emailproject019-beep/DecisionDesk.git
   cd DecisionDesk
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:3000
   ```

The application will display the decision matrix UI where you can manually add alternatives, criteria, and scores.

---

## Chrome WebMCP Testing Instructions

To connect Claude (or another MCP-compatible agent) to DecisionDesk:

### Option A: Claude Desktop (Recommended)

1. **Install Claude Desktop** from https://claude.ai/download

2. **Locate the config file:**
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux:** `~/.config/Claude/claude_desktop_config.json`

3. **Add DecisionDesk as an MCP server:**
   ```json
   {
     "mcpServers": {
       "decisiondesk": {
         "command": "node",
         "args": ["/path/to/DecisionDesk/build/server.js"],
         "env": {
           "NODE_ENV": "production"
         }
       }
     }
   }
   ```

4. **Restart Claude Desktop** to load the configuration.

5. **In Claude, type:**
   ```
   I have DecisionDesk running on localhost:3000. 
   Can you help me evaluate my technology decisions?
   ```

Claude will now have access to the four DecisionDesk tools.

### Option B: Browser-Based Testing (Development)

If you want to test without Claude Desktop:

1. Use the **Next.js UI** at `http://localhost:3000` to manually:
   - Add alternatives
   - Define criteria with weights
   - Assign scores

2. Then connect an external MCP client (like Claude Desktop) to read and modify the decision.

---

## Example Agent Prompt

When connected to DecisionDesk, you can give Claude prompts like:

```
I need to decide between three cloud providers for our backend:
1. AWS
2. Google Cloud
3. Azure

Key considerations:
- Cost (how cost-effective is it?)
- Vendor lock-in (how portable is our architecture?)
- Team expertise (how well does our team know the platform?)
- Compliance (how well does it meet our data residency requirements?)

Can you help me set up the decision matrix, then score each option 
based on your analysis? 
Start with the criteria and weights, then evaluate each provider.
```

Claude will:
1. Call `add_criterion` for Cost, Vendor Lock-in, Team Expertise, Compliance (with appropriate weights)
2. Call `add_alternative` for AWS, Google Cloud, Azure
3. Call `set_score` to evaluate each provider across dimensions
4. Call `get_decision_state` to summarize the decision

---

## Expected Results

After running the example prompt above, you should see:

**Console Output:**
```
Criteria added:
  - Cost (weight: 25)
  - Vendor Lock-in (weight: 20)
  - Team Expertise (weight: 30)
  - Compliance (weight: 25)

Alternatives added:
  - AWS
  - Google Cloud
  - Azure

Scores assigned across all dimensions...

Final Weighted Scores:
  AWS: 7.8/10
  Google Cloud: 7.2/10
  Azure: 6.9/10
```

**UI Update:**
- The decision matrix on `http://localhost:3000` will update in real-time
- Scores appear as a heatmap
- Weighted totals calculate automatically

---

## Deployment Instructions

### Deploy to Vercel (Recommended)

1. **Push your repository to GitHub:**
   ```bash
   git add .
   git commit -m "DecisionDesk with WebMCP"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com) and import the repository:**
   - Sign in with GitHub
   - Click "New Project"
   - Select `emailproject019-beep/DecisionDesk`
   - Framework preset: **Next.js**
   - Deploy

3. **Configure MCP server (optional, for headless agents):**
   - Export the MCP server as a separate endpoint
   - Use Vercel Functions or a separate Node.js hosting

### Deploy to Self-Hosted Server

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

3. **Use a reverse proxy (nginx/Apache):**
   ```nginx
   server {
       listen 80;
       server_name decisiondesk.example.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Connect Claude Desktop to the remote server:**
   ```json
   {
     "mcpServers": {
       "decisiondesk": {
         "command": "curl",
         "args": ["-X", "POST", "https://decisiondesk.example.com/api/mcp"]
       }
     }
   }
   ```

---

## Human/Agent Workflow

DecisionDesk enables a **collaborative decision-making cycle**:

### Phase 1: Setup (Human)
1. Define the decision to be made
2. Identify alternatives under consideration
3. Determine evaluation criteria and their relative importance

### Phase 2: Analysis (Agent)
1. Agent receives the decision context via `get_decision_state`
2. Agent applies reasoning, domain knowledge, and data to score alternatives
3. Agent calls `set_score` to populate the matrix with analysis results
4. Agent explains its scoring rationale in natural language

### Phase 3: Review (Human)
1. Human reviews agent's scores and reasoning
2. Human can manually adjust scores through the UI
3. Human can request agent re-analysis if needed

### Phase 4: Refinement (Collaborative)
1. Human or agent adds new criteria/alternatives as needed
2. Cycle repeats until consensus is reached
3. Final weighted scores guide the decision

### Phase 5: Archive (Human)
1. Export or screenshot the final decision matrix
2. Store alongside the decision record
3. Reference for future decisions or audits

### Example Workflow

```
Human: "Help me pick a database for our new product"
  ↓
Agent: Calls get_decision_state (empty)
  ↓
Agent: Adds alternatives (PostgreSQL, MongoDB, DynamoDB)
Agent: Adds criteria (Query Speed, Scalability, Cost, Ops Complexity)
  ↓
Agent: Scores each option based on published benchmarks
  ↓
Human: Reviews scores, adjusts "Ops Complexity" to reflect team constraints
  ↓
Agent: Explains why PostgreSQL scored highest
  ↓
Human: Makes final decision with full transparency and reasoning
```

---

## Tech Stack

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **State Management:** Zustand
- **MCP Server:** @modelcontextprotocol/sdk (browser-based)
- **Icons:** Lucide React
- **Language:** TypeScript

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR to improve DecisionDesk.

---

**Ready to make better decisions?** Start DecisionDesk today and bring transparency to your hardest choices.
