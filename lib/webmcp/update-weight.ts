export const updateWeightTool = {
  name: "update_weight",
  description: "Update the weight of a specific criterion.",
  inputSchema: {
    type: "object",
    properties: {
      criterionId: { type: "string" },
      weight: { type: "number", description: "Weight between 0.0 and 1.0" }
    },
    required: ["criterionId", "weight"]
  }
};

export function handleUpdateWeight(store: any, args: any) {
  const { criterionId, weight } = args;
  store.updateWeight(criterionId, weight);
  store.addActivity(`Agent updated weight for ${criterionId} to ${weight}`);
  return { content: [{ type: "text", text: `Success: Updated weight to ${weight}` }] };
}
