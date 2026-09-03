import { useDecisionStore } from "../decision-store";
import { calculateRankings } from "../decision-engine";
import type { DecisionState } from "../../types/decision";

/**
 * Minimal local typings for the experimental WebMCP browser API.
 *
 * This avoids making the whole application depend on experimental
 * TypeScript DOM definitions. You can replace these later with
 * `webmcp-types` if desired.
 */

type JSONSchema = {
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: unknown;
};

type WebMCPTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema: JSONSchema;

  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };

  execute: (
    input: Record<string, any>,
    client?: {
      signal?: AbortSignal;
    }
  ) => Promise<string> | string;
};

type WebMCPModelContext = {
  registerTool: (
    tool: WebMCPTool,
    options?: {
      signal?: AbortSignal;
    }
  ) => Promise<void>;
};

type WebMCPDocument = Document & {
  modelContext?: WebMCPModelContext;
};

/**
 * A single controller is kept at module scope.
 *
 * This is particularly useful with React Strict Mode because components
 * can mount twice during development. Aborting the previous controller
 * unregisters the previously registered tool set before registering again.
 */
let registrationController: AbortController | null = null;

/**
 * Register all DecisionDesk WebMCP tools.
 *
 * Returns a cleanup function that unregisters the tools.
 */
export function registerDecisionDeskTools(): () => void {
  if (typeof document === "undefined") {
    return () => {};
  }

  const webDocument = document as WebMCPDocument;
  const modelContext = webDocument.modelContext;

  /**
   * WebMCP won't exist in an ordinary browser unless WebMCP support
   * has been enabled.
   */
  if (!modelContext) {
    console.warn(
      "[DecisionDesk] WebMCP is not available in this browser."
    );

    return () => {};
  }

  /**
   * Remove tools from any previous registration attempt.
   */
  if (registrationController) {
    registrationController.abort();
  }

  registrationController = new AbortController();

  const { signal } = registrationController;

  /**
   * Helper for registering tools without making one registration failure
   * prevent the remaining tools from loading.
   */
  const register = (tool: WebMCPTool) => {
    void modelContext
      .registerTool(tool, { signal })
      .then(() => {
        console.info(
          `[DecisionDesk] Registered WebMCP tool: ${tool.name}`
        );
      })
      .catch((error) => {
        /**
         * Ignore AbortError because it occurs normally when the
         * component unmounts or tools are re-registered.
         */
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error(
          `[DecisionDesk] Could not register WebMCP tool "${tool.name}".`,
          error
        );
      });
  };

  // ------------------------------------------------------------------
  // Tool 1: get_decision
  // ------------------------------------------------------------------

  register({
    name: "get_decision",

    title: "Get current decision",

    description:
      "Read the current DecisionDesk decision, including alternatives, criteria, scores, constraints, and calculated rankings. Use this before modifying the decision so you understand its current state.",

    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },

    annotations: {
      readOnlyHint: true,
    },

    execute: async () => {
      try {
        const state = useDecisionStore.getState();

        const decision: DecisionState = {
          id: state.id,
          title: state.title,
          options: state.options,
          criteria: state.criteria,
          scores: state.scores,
        };

        const rankings = calculateRankings(decision);

        state.addActivity(
          "WebMCP: Agent read the current decision."
        );

        return JSON.stringify(
          {
            success: true,
            decision: {
              id: decision.id,
              title: decision.title,
              options: decision.options,
              criteria: decision.criteria,
              scores: decision.scores,
            },
            rankings,
          },
          null,
          2
        );
      } catch (error) {
        console.error(
          "[DecisionDesk] get_decision failed:",
          error
        );

        return JSON.stringify({
          success: false,
          error: getErrorMessage(error),
        });
      }
    },
  });

  // ------------------------------------------------------------------
  // Tool 2: update_criterion_weight
  // ------------------------------------------------------------------

  register({
    name: "update_criterion_weight",

    title: "Update criterion weight",

    description:
      "Change the weight of one decision criterion. Weight must be a decimal from 0 to 1, where 0.40 represents 40%. Use get_decision first to obtain valid criterion IDs.",

    inputSchema: {
      type: "object",

      properties: {
        criterionId: {
          type: "string",
          description:
            "The exact ID of the criterion whose weight should change.",
        },

        weight: {
          type: "number",
          minimum: 0,
          maximum: 1,
          description:
            "New criterion weight as a decimal between 0 and 1. Example: 0.40 means 40%.",
        },
      },

      required: ["criterionId", "weight"],

      additionalProperties: false,
    },

    annotations: {
      readOnlyHint: false,
    },

    execute: async (input) => {
      try {
        const criterionId = String(input.criterionId ?? "");
        const weight = Number(input.weight);

        if (!criterionId) {
          return JSON.stringify({
            success: false,
            error: "criterionId is required.",
          });
        }

        if (
          !Number.isFinite(weight) ||
          weight < 0 ||
          weight > 1
        ) {
          return JSON.stringify({
            success: false,
            error:
              "weight must be a number between 0 and 1.",
          });
        }

        const stateBefore = useDecisionStore.getState();

        const criterion = stateBefore.criteria.find(
          (item) => item.id === criterionId
        );

        if (!criterion) {
          return JSON.stringify({
            success: false,
            error: `Criterion "${criterionId}" was not found.`,
            validCriterionIds: stateBefore.criteria.map(
              (item) => item.id
            ),
          });
        }

        const previousWeight = criterion.weight;

        stateBefore.updateWeight(criterionId, weight);

        /**
         * Read the store again because Zustand state has now changed.
         */
        const stateAfter = useDecisionStore.getState();

        stateAfter.addActivity(
          `WebMCP: Changed ${criterion.name} weight from ${formatPercent(
            previousWeight
          )} to ${formatPercent(weight)}.`
        );

        const decisionAfter: DecisionState = {
          id: stateAfter.id,
          title: stateAfter.title,
          options: stateAfter.options,
          criteria: stateAfter.criteria,
          scores: stateAfter.scores,
        };

        const rankings = calculateRankings(decisionAfter);

        return JSON.stringify(
          {
            success: true,

            criterion: {
              id: criterionId,
              name: criterion.name,
              previousWeight,
              newWeight: weight,
            },

            rankings,
          },
          null,
          2
        );
      } catch (error) {
        console.error(
          "[DecisionDesk] update_criterion_weight failed:",
          error
        );

        return JSON.stringify({
          success: false,
          error: getErrorMessage(error),
        });
      }
    },
  });

  // ------------------------------------------------------------------
  // Tool 3: set_constraint
  // ------------------------------------------------------------------

  register({
    name: "set_constraint",

    title: "Set criterion constraint",

    description:
      "Enable or disable a hard constraint for a decision criterion. In the current DecisionDesk MVP, constrained criteria require an option score of at least 5 to remain eligible. Use get_decision first to obtain valid criterion IDs.",

    inputSchema: {
      type: "object",

      properties: {
        criterionId: {
          type: "string",
          description:
            "The exact ID of the criterion to configure.",
        },

        isConstraint: {
          type: "boolean",
          description:
            "True to enforce the criterion as a hard constraint; false to remove the constraint.",
        },
      },

      required: ["criterionId", "isConstraint"],

      additionalProperties: false,
    },

    annotations: {
      readOnlyHint: false,
    },

    execute: async (input) => {
      try {
        const criterionId = String(input.criterionId ?? "");
        const isConstraint = input.isConstraint;

        if (!criterionId) {
          return JSON.stringify({
            success: false,
            error: "criterionId is required.",
          });
        }

        if (typeof isConstraint !== "boolean") {
          return JSON.stringify({
            success: false,
            error: "isConstraint must be true or false.",
          });
        }

        const stateBefore = useDecisionStore.getState();

        const criterion = stateBefore.criteria.find(
          (item) => item.id === criterionId
        );

        if (!criterion) {
          return JSON.stringify({
            success: false,
            error: `Criterion "${criterionId}" was not found.`,
            validCriterionIds: stateBefore.criteria.map(
              (item) => item.id
            ),
          });
        }

        stateBefore.setConstraint(
          criterionId,
          isConstraint
        );

        const stateAfter = useDecisionStore.getState();

        stateAfter.addActivity(
          isConstraint
            ? `WebMCP: Enabled hard constraint for ${criterion.name}.`
            : `WebMCP: Removed hard constraint from ${criterion.name}.`
        );

        const decisionAfter: DecisionState = {
          id: stateAfter.id,
          title: stateAfter.title,
          options: stateAfter.options,
          criteria: stateAfter.criteria,
          scores: stateAfter.scores,
        };

        const rankings = calculateRankings(decisionAfter);

        return JSON.stringify(
          {
            success: true,

            criterion: {
              id: criterionId,
              name: criterion.name,
              isConstraint,
              currentMinimumScore: isConstraint ? 5 : null,
            },

            rankings,
          },
          null,
          2
        );
      } catch (error) {
        console.error(
          "[DecisionDesk] set_constraint failed:",
          error
        );

        return JSON.stringify({
          success: false,
          error: getErrorMessage(error),
        });
      }
    },
  });

  // ------------------------------------------------------------------
  // Tool 4: run_scenario
  // ------------------------------------------------------------------

  register({
    name: "run_scenario",

    title: "Run decision scenario",

    description:
      "Run a what-if decision analysis using temporary criterion weights and return the resulting ranking. This does not permanently modify the current DecisionDesk weights. Criterion IDs should match those returned by get_decision.",

    inputSchema: {
      type: "object",

      properties: {
        scenarioName: {
          type: "string",
          description:
            "Human-readable name for this scenario, such as 'Cost-sensitive scenario'.",
        },

        weights: {
          type: "object",

          description:
            "Map of criterion IDs to temporary weights. Each value must be between 0 and 1.",

          additionalProperties: {
            type: "number",
            minimum: 0,
            maximum: 1,
          },
        },
      },

      required: ["scenarioName", "weights"],

      additionalProperties: false,
    },

    annotations: {
      readOnlyHint: true,
    },

    execute: async (input) => {
      try {
        const scenarioName = String(
          input.scenarioName ?? ""
        ).trim();

        const inputWeights = input.weights;

        if (!scenarioName) {
          return JSON.stringify({
            success: false,
            error: "scenarioName is required.",
          });
        }

        if (
          !inputWeights ||
          typeof inputWeights !== "object" ||
          Array.isArray(inputWeights)
        ) {
          return JSON.stringify({
            success: false,
            error:
              "weights must be an object mapping criterion IDs to numeric weights.",
          });
        }

        const weights = inputWeights as Record<
          string,
          unknown
        >;

        const currentState =
          useDecisionStore.getState();

        const validCriterionIds = new Set(
          currentState.criteria.map(
            (criterion) => criterion.id
          )
        );

        /**
         * Validate all criterion IDs and weight values.
         */
        for (const [criterionId, rawWeight] of Object.entries(
          weights
        )) {
          if (!validCriterionIds.has(criterionId)) {
            return JSON.stringify({
              success: false,
              error: `Unknown criterion ID "${criterionId}".`,
              validCriterionIds: [
                ...Array.from(validCriterionIds),
              ],
            });
          }

          const weight = Number(rawWeight);

          if (
            !Number.isFinite(weight) ||
            weight < 0 ||
            weight > 1
          ) {
            return JSON.stringify({
              success: false,
              error: `Weight for "${criterionId}" must be between 0 and 1.`,
            });
          }
        }

        /**
         * Build a temporary decision state.
         *
         * This intentionally DOES NOT call updateWeight().
         * run_scenario is a read-only what-if analysis.
         */
        const scenarioState: DecisionState = {
          id: currentState.id,
          title: currentState.title,
          options: currentState.options,

          criteria: currentState.criteria.map(
            (criterion) => ({
              ...criterion,

              weight:
                weights[criterion.id] !== undefined
                  ? Number(weights[criterion.id])
                  : criterion.weight,
            })
          ),

          scores: currentState.scores,
        };

        const baselineState: DecisionState = {
          id: currentState.id,
          title: currentState.title,
          options: currentState.options,
          criteria: currentState.criteria,
          scores: currentState.scores,
        };

        const baselineRanking =
          calculateRankings(baselineState);

        const scenarioRanking =
          calculateRankings(scenarioState);

        currentState.addActivity(
          `WebMCP: Ran scenario "${scenarioName}".`
        );

        const baselineWinner =
          baselineRanking.find(
            (option) => option.passesConstraints
          ) ?? baselineRanking[0];

        const scenarioWinner =
          scenarioRanking.find(
            (option) => option.passesConstraints
          ) ?? scenarioRanking[0];

        return JSON.stringify(
          {
            success: true,

            scenario: {
              name: scenarioName,

              appliedWeights:
                scenarioState.criteria.reduce<
                  Record<string, number>
                >((result, criterion) => {
                  result[criterion.id] =
                    criterion.weight;

                  return result;
                }, {}),
            },

            baseline: {
              winner: baselineWinner
                ? {
                    id: baselineWinner.id,
                    name: baselineWinner.name,
                    score:
                      baselineWinner.totalScore,
                  }
                : null,

              rankings: baselineRanking,
            },

            scenarioResult: {
              winner: scenarioWinner
                ? {
                    id: scenarioWinner.id,
                    name: scenarioWinner.name,
                    score:
                      scenarioWinner.totalScore,
                  }
                : null,

              rankings: scenarioRanking,
            },

            winnerChanged:
              baselineWinner?.id !==
              scenarioWinner?.id,
          },
          null,
          2
        );
      } catch (error) {
        console.error(
          "[DecisionDesk] run_scenario failed:",
          error
        );

        return JSON.stringify({
          success: false,
          error: getErrorMessage(error),
        });
      }
    },
  });

  console.info(
    "[DecisionDesk] WebMCP registration started."
  );

  /**
   * React can call this on component unmount.
   */
  return () => {
    registrationController?.abort();

    registrationController = null;

    console.info(
      "[DecisionDesk] WebMCP tools unregistered."
    );
  };
}

// --------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}
