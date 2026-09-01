"use client";
import { useDecisionStore } from '@/lib/decision-store';

export default function OptionsTable() {
  const { options, criteria, scores } = useDecisionStore();

  const getScore = (optId: string, critId: string) => 
    scores.find(s => s.optionId === optId && s.criterionId === critId)?.value || '-';

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-800">Options & Scores (1-10)</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-medium text-gray-600">Provider</th>
              {criteria.map(c => (
                <th key={c.id} className="p-4 font-medium text-gray-600 text-center">
                  {c.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {options.map(opt => (
              <tr key={opt.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-900">{opt.name}</td>
                {criteria.map(c => (
                  <td key={c.id} className="p-4 text-center text-gray-600">
                    {getScore(opt.id, c.id)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
