import { create } from 'zustand';
import { DecisionState, Option, Criterion, Score } from '../types/decision';
import { seedState } from './seed-data';

interface DecisionStore extends DecisionState {
  setDecision: (state: DecisionState) => void;
  updateWeight: (criterionId: string, newWeight: number) => void;
  scoreOption: (optionId: string, criterionId: string, value: number) => void;
  addActivity: (message: string) => void;
  agentActivities: string[];
}

export const useDecisionStore = create<DecisionStore>((set) => ({
  ...seedState,
  agentActivities: [],
  setDecision: (state) => set(() => ({ ...state })),
  updateWeight: (criterionId, newWeight) => 
    set((state) => ({
      criteria: state.criteria.map(c => 
        c.id === criterionId ? { ...c, weight: newWeight } : c
      )
    })),
  scoreOption: (optionId, criterionId, value) =>
    set((state) => {
      const filteredScores = state.scores.filter(
        s => !(s.optionId === optionId && s.criterionId === criterionId)
      );
      return { scores: [...filteredScores, { optionId, criterionId, value }] };
    }),
  addActivity: (message) => 
    set((state) => ({ agentActivities: [message, ...state.agentActivities] }))
}));
