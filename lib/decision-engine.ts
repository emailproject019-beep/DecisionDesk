import { DecisionState, RankedOption } from '../types/decision';

export function calculateRankings(state: DecisionState): RankedOption[] {
  const results = state.options.map(option => {
    let totalScore = 0;
    const breakdown: Record<string, number> = {};
    let passesConstraints = true;

    state.criteria.forEach(crit => {
      const scoreEntry = state.scores.find(
        s => s.optionId === option.id && s.criterionId === crit.id
      );
      const rawValue = scoreEntry ? scoreEntry.value : 0;
      
      if (crit.isConstraint && rawValue < 5) { // Example constraint threshold
        passesConstraints = false;
      }

      const weightedValue = rawValue * crit.weight;
      breakdown[crit.name] = weightedValue;
      totalScore += weightedValue;
    });

    return {
      ...option,
      totalScore: passesConstraints ? Number(totalScore.toFixed(2)) : 0,
      breakdown,
      passesConstraints
    };
  });

  return results.sort((a, b) => b.totalScore - a.totalScore);
}
