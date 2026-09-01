import OptionsTable from '@/components/OptionsTable';
import CriteriaPanel from '@/components/CriteriaPanel';
import RankingPanel from '@/components/RankingPanel';
import AgentActivity from '@/components/AgentActivity';

export default function DecisionWorkspace({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
          <h1 className="text-xl font-bold text-gray-900">DecisionDesk Workspace</h1>
          <span className="text-sm text-gray-500 ml-auto">ID: {params.id}</span>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Choose a Hosting Provider</h2>
          <p className="text-gray-600">Evaluating 4 options across 4 weighted criteria.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <OptionsTable />
            <CriteriaPanel />
          </div>
          
          <div className="space-y-6">
            <RankingPanel />
            <AgentActivity />
          </div>
        </div>
      </main>
    </div>
  );
}
