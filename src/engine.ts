export interface Alternative { id: string; name: string; description?: string; }
export interface Criterion { id: string; name: string; weight: number; }
export interface Score { altId: string; critId: string; value: number; }

export class DecisionEngine {
  alternatives: Alternative[] = [];
  criteria: Criterion[] = [];
  scores: Score[] = [];

  addAlternative(name: string, description?: string) {
    const id = `alt_${Date.now()}`;
    this.alternatives.push({ id, name, description });
    return id;
  }

  addCriterion(name: string, weight: number) {
    const id = `crit_${Date.now()}`;
    this.criteria.push({ id, name, weight });
    return id;
  }

  setScore(altId: string, critId: string, value: number) {
    // Remove existing score if present
    this.scores = this.scores.filter(s => !(s.altId === altId && s.critId === critId));
    this.scores.push({ altId, critId, value });
  }

  calculateRankings() {
    const results = this.alternatives.map(alt => {
      let totalScore = 0;
      const breakdown: Record<string, number> = {};

      this.criteria.forEach(crit => {
        const scoreEntry = this.scores.find(s => s.altId === alt.id && s.critId === crit.id);
        const rawValue = scoreEntry ? scoreEntry.value : 0;
        const weightedValue = rawValue * crit.weight;
        
        breakdown[crit.name] = weightedValue;
        totalScore += weightedValue;
      });

      return {
        id: alt.id,
        name: alt.name,
        totalScore,
        breakdown
      };
    });

    return results.sort((a, b) => b.totalScore - a.totalScore);
  }

  getState() {
    return {
      alternatives: this.alternatives,
      criteria: this.criteria,
      scores: this.scores,
      rankings: this.calculateRankings()
    };
  }
}
