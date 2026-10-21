import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import PipelineProgressBar from './components/PipelineProgressBar';
import DashboardOverview from './pages/DashboardOverview';
import Module1Page from './pages/Module1Page';
import Module2Page from './pages/Module2Page';
import Module3Page from './pages/Module3Page';
import Module4Page from './pages/Module4Page';
import DatasetExplorerPage from './pages/DatasetExplorerPage';
import ExcelViewerPage from './pages/ExcelViewerPage';
import FAQPage from './pages/FAQPage';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePipelineCompleted = () => {
    // Increment key to trigger sub-page data reload
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex h-screen bg-darkbg text-slate-100 overflow-hidden font-sans">
      {/* Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Global Pipeline Execution Track */}
          <PipelineProgressBar onPipelineCompleted={handlePipelineCompleted} />

          {/* Active Tab View */}
          <div key={refreshKey}>
            {activeTab === 'dashboard' && <DashboardOverview setActiveTab={setActiveTab} />}
            {activeTab === 'module1' && <Module1Page />}
            {activeTab === 'module2' && <Module2Page />}
            {activeTab === 'module3' && <Module3Page />}
            {activeTab === 'module4' && <Module4Page />}
            {activeTab === 'excel-viewer' && <ExcelViewerPage />}
            {activeTab === 'dataset' && <DatasetExplorerPage />}
            {activeTab === 'faq' && <FAQPage />}
          </div>
        </div>
      </main>
    </div>
  );
}
