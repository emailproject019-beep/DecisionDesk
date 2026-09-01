export interface Option {
  id: string;
  name: string;
  description?: string;
}

export interface Criterion {
  id: string;
  name: string;
  weight: number; // 0.0 to 1.0
  isConstraint?: boolean;
}

export interface Score {
  optionId: string;
  criterionId: string;
  value: number; // typically 1-10
}

export interface RankedOption extends Option {
  totalScore: number;
  breakdown: Record<string, number>;
  passesConstraints: boolean;
}

export interface DecisionState {
  id: string;
  title: string;
  options: Option[];
  criteria: Criterion[];
  scores: Score[];
}

export interface Scenario {
  id: string;
  name: string;
  state: DecisionState;
}
