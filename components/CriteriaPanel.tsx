"use client";
import { useDecisionStore } from '@/lib/decision-store';

export default function CriteriaPanel() {
  const criteria = useDecisionStore((state) => state.criteria);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">Criteria Weights</h2>
      </div>
      <ul className="divide-y divide-gray-100 p-4 space-y-2">
        {criteria.map(c => (
          <li key={c.id} className="flex justify-between items-center py-2">
            <span className="font-medium text-gray-700">
              {c.name} {c.isConstraint && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded ml-2">Constraint</span>}
            </span>
            <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-semibold">
              {(c.weight * 100).toFixed(0)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
