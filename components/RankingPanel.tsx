"use client";
import { useDecisionStore } from '@/lib/decision-store';
import { calculateRankings } from '@/lib/decision-engine';

export default function RankingPanel() {
  const state = useDecisionStore();
  const rankings = calculateRankings(state);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 border-t-4 border-t-blue-500">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Final Rankings</h2>
      </div>
      <ul className="divide-y divide-gray-100">
        {rankings.map((opt, idx) => (
          <li key={opt.id} className={`flex justify-between items-center p-4 ${idx === 0 ? 'bg-blue-50/50' : ''}`}>
            <div className="flex items-center gap-3">
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-bold ${idx === 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {idx + 1}
              </span>
              <span className="font-semibold text-gray-900">{opt.name}</span>
            </div>
            <span className="font-bold text-xl text-gray-800">
              {opt.passesConstraints ? opt.totalScore : <span className="text-sm text-red-500">Eliminated</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
