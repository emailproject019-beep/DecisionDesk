"use client";
import { useDecisionStore } from '../lib/decision-store';
import { calculateRankings } from '../lib/decision-engine';

export default function RankingPanel() {
  const state = useDecisionStore();
  const rankings = calculateRankings(state);

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-4">Rankings</h2>
      <ul>
        {rankings.map((opt, idx) => (
          <li key={opt.id} className="flex justify-between p-2 border-b">
            <span>
              <span className="font-bold mr-2">#{idx + 1}</span>
              {opt.name}
            </span>
            <span className="font-semibold text-blue-600">
              {opt.passesConstraints ? opt.totalScore.toFixed(2) : "FAILED CONSTRAINTS"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
