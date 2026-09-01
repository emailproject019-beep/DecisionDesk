import { create } from 'zustand';
import { DecisionState } from '../types/decision';
import { seedDecision } from './seed-data';

interface DecisionStore extends DecisionState {
  updateWeight: (criterionId: string, newWeight: number) => void;
  setConstraint: (criterionId: string, isConstraint: boolean) => void;
  addActivity: (message: string) => void;
  agentActivities: string[];
}

export const useDecisionStore = create<DecisionStore>((set) => ({
  ...seedDecision,
  agentActivities: ["System initialized. Seed data loaded."],
  updateWeight: (criterionId, newWeight) => 
    set((state) => ({
      criteria: state.criteria.map(c => 
        c.id === criterionId ? { ...c, weight: newWeight } : c
      )
    })),
  setConstraint: (criterionId, isConstraint) =>
    set((state) => ({
      criteria: state.criteria.map(c => 
        c.id === criterionId ? { ...c, isConstraint } : c
      )
    })),
  addActivity: (message) => 
    set((state) => ({ agentActivities: [message, ...state.agentActivities] }))
}));
