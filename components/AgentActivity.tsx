"use client";
import { useDecisionStore } from '@/lib/decision-store';

export default function AgentActivity() {
  const activities = useDecisionStore((state) => state.agentActivities);

  return (
    <div className="bg-gray-900 rounded-lg shadow overflow-hidden flex flex-col h-64">
      <div className="px-4 py-3 border-b border-gray-800 bg-gray-950 flex items-center justify-between">
        <h2 className="text-sm font-mono text-green-400">Agent Activity Stream</h2>
        <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
      </div>
      <div className="p-4 flex-1 overflow-y-auto space-y-3 font-mono text-xs">
        {activities.map((msg, i) => (
          <div key={i} className="text-gray-300">
            <span className="text-gray-500 mr-2">{'>'}</span>
            {msg}
          </div>
        ))}
      </div>
    </div>
  );
}
