"use client";
import { useDecisionStore } from '../lib/decision-store';

export default function OptionsTable() {
  const { options, criteria, scores } = useDecisionStore();

  const getScore = (optId: string, critId: string) => 
    scores.find(s => s.optionId === optId && s.criterionId === critId)?.value || '-';

  return (
    <div className="overflow-x-auto bg-white rounded shadow mt-4">
      <table className="w-full text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-3">Option</th>
            {criteria.map(c => (
              <th key={c.id} className="p-3">{c.name} ({c.weight})</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {options.map(opt => (
            <tr key={opt.id} className="border-b">
              <td className="p-3 font-medium">{opt.name}</td>
              {criteria.map(c => (
                <td key={c.id} className="p-3 text-gray-600">
                  {getScore(opt.id, c.id)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
