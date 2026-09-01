import { DecisionState } from '../types/decision';

export const seedDecision: DecisionState = {
  id: "hosting-123",
  title: "Choose a Hosting Provider",
  options: [
    { id: "opt_vercel", name: "Vercel" },
    { id: "opt_cloudflare", name: "Cloudflare" },
    { id: "opt_render", name: "Render" },
    { id: "opt_netlify", name: "Netlify" },
  ],
  criteria: [
    { id: "crit_cost", name: "Cost", weight: 0.2 },
    { id: "crit_perf", name: "Performance", weight: 0.3 },
    { id: "crit_rel", name: "Reliability", weight: 0.3 },
    { id: "crit_dev", name: "Developer Experience", weight: 0.2 },
  ],
  scores: [
    // Vercel
    { optionId: "opt_vercel", criterionId: "crit_cost", value: 6 },
    { optionId: "opt_vercel", criterionId: "crit_perf", value: 9 },
    { optionId: "opt_vercel", criterionId: "crit_rel", value: 9 },
    { optionId: "opt_vercel", criterionId: "crit_dev", value: 10 },
    // Cloudflare
    { optionId: "opt_cloudflare", criterionId: "crit_cost", value: 9 },
    { optionId: "opt_cloudflare", criterionId: "crit_perf", value: 10 },
    { optionId: "opt_cloudflare", criterionId: "crit_rel", value: 10 },
    { optionId: "opt_cloudflare", criterionId: "crit_dev", value: 7 },
    // Render
    { optionId: "opt_render", criterionId: "crit_cost", value: 8 },
    { optionId: "opt_render", criterionId: "crit_perf", value: 7 },
    { optionId: "opt_render", criterionId: "crit_rel", value: 8 },
    { optionId: "opt_render", criterionId: "crit_dev", value: 8 },
    // Netlify
    { optionId: "opt_netlify", criterionId: "crit_cost", value: 7 },
    { optionId: "opt_netlify", criterionId: "crit_perf", value: 8 },
    { optionId: "opt_netlify", criterionId: "crit_rel", value: 9 },
    { optionId: "opt_netlify", criterionId: "crit_dev", value: 9 },
  ]
};
