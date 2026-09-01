import RankingPanel from '@/components/RankingPanel';
import OptionsTable from '@/components/OptionsTable';
import AgentActivity from '@/components/AgentActivity';

export default function DecisionWorkspace({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Decision Workspace: {params.id}</h1>
        <p className="text-gray-600">Humans and Agents collaborating on multi-criteria analysis.</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <OptionsTable />
          {/* Include <ScenarioComparison /> and <CriteriaPanel /> here */}
        </div>
        
        <div className="space-y-6">
          <RankingPanel />
          <AgentActivity />
        </div>
      </div>
    </div>
  );
}
