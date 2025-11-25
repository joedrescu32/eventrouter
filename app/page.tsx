'use client';
import React, { useState } from 'react';
import { ViewState, Message } from '../types';
import { IngestView } from '../components/IngestView';
import { ScheduleView } from '../components/ScheduleView';
import { AnalysisView } from '../components/AnalysisView';
import { WarehouseView } from '../components/WarehouseView';
import { 
  UploadCloud,
  Map,
  BarChart3,
  Package
} from 'lucide-react';

/* 
  NEXT.JS SETUP INSTRUCTIONS:
  1. This file represents your main page. Copy the contents of this component into `app/page.tsx`.
  2. Ensure you have 'use client' at the top (already added).
  3. Verify import paths for components and types based on your folder structure.
*/

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.INGEST);
  const [input, setInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Ready for logistics. Drop a manifest to begin or ask me to check the schedule.",
      timestamp: new Date()
    }
  ]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const command = input.toLowerCase();
    setInput('');
    setIsAiThinking(true);

    // Simulated AI Logic
    setTimeout(() => {
      let responseContent = "";
      let action: ViewState | undefined;

      if (command.includes('schedule') || command.includes('route') || command.includes('map')) {
        responseContent = "Pulling up the live schedule. I've isolated a potential conflict near the Downtown Loft.";
        action = ViewState.SCHEDULE;
      } else if (command.includes('warehouse') || command.includes('vehicle') || command.includes('item') || command.includes('truck')) {
        responseContent = "Opening Warehouse Control. Vehicle 104 is currently loading.";
        action = ViewState.WAREHOUSE;
      } else if (command.includes('analysis') || command.includes('cost') || command.includes('report') || command.includes('numbers')) {
        responseContent = "Here is the weekly analysis. Efficiency metrics are trending positive.";
        action = ViewState.ANALYSIS;
      } else if (command.includes('ingest') || command.includes('upload') || command.includes('order') || command.includes('add')) {
        responseContent = "Ready for new orders. Drag and drop your files directly onto the canvas.";
        action = ViewState.INGEST;
      } else {
        responseContent = "I can help with that. Try asking to see the 'Schedule', 'Warehouse', or 'Analysis'.";
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        action
      };

      setMessages(prev => [...prev, aiMsg]);
      if (action) setCurrentView(action);
      setIsAiThinking(false);
    }, 1200);
  };

  // Dynamic View Renderer
  const renderView = () => {
    switch (currentView) {
      case ViewState.INGEST: 
        return <IngestView 
                  input={input} 
                  setInput={setInput} 
                  onCommand={handleCommand} 
                  isAiThinking={isAiThinking} 
                  messages={messages} 
               />;
      case ViewState.SCHEDULE: 
        return <ScheduleView 
                  input={input} 
                  setInput={setInput} 
                  onCommand={handleCommand} 
                  isAiThinking={isAiThinking} 
                  messages={messages} 
               />;
      case ViewState.ANALYSIS: return <AnalysisView />;
      case ViewState.WAREHOUSE: return <WarehouseView />;
      default: return <IngestView 
                        input={input} 
                        setInput={setInput} 
                        onCommand={handleCommand} 
                        isAiThinking={isAiThinking} 
                        messages={messages} 
                      />;
    }
  };

  const navItems = [
    { id: ViewState.INGEST, label: 'Ingest', icon: UploadCloud },
    { id: ViewState.SCHEDULE, label: 'Schedule', icon: Map },
    { id: ViewState.ANALYSIS, label: 'Analysis', icon: BarChart3 },
    { id: ViewState.WAREHOUSE, label: 'Warehouse', icon: Package },
  ];

  return (
    <div className="flex h-screen bg-canvas text-primary font-sans overflow-hidden relative selection:bg-accent/20">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-200/30 rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/30 rounded-full blur-[120px] pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

      {/* Top Left: Brand Logo */}
      <div className="absolute top-6 left-6 z-50 flex items-center gap-3 animate-fade-in pointer-events-none select-none">
          <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                  <polyline points="7.5 4.21 12 12 16.5 4.21"></polyline>
                  <polyline points="7.5 19.79 7.5 14.6 3 12"></polyline>
                  <polyline points="21 12 16.5 14.6 16.5 19.79"></polyline>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                  <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
          </div>
          <div className="text-left hidden md:block">
              <h1 className="text-lg font-bold tracking-tight text-primary leading-none">EventRouter</h1>
              <p className="text-[10px] font-medium text-subtle uppercase tracking-widest">Logistics OS</p>
          </div>
      </div>

      {/* Top Center: Navigation Dock */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
        <nav className="glass-panel p-1.5 rounded-full flex items-center gap-1 shadow-sm hover:shadow-md transition-all duration-300">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`
                relative px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all duration-300 group
                ${currentView === item.id
                  ? 'bg-white text-primary shadow-sm ring-1 ring-black/5'
                  : 'text-subtle hover:text-primary hover:bg-white/40'}
              `}
            >
              <item.icon size={18} className={`transition-colors duration-300 ${currentView === item.id ? 'text-accent' : 'group-hover:text-primary'}`} />
              <span className={`
                  overflow-hidden whitespace-nowrap transition-all duration-500
                  ${currentView === item.id ? 'max-w-[100px] opacity-100 ml-1' : 'max-w-0 opacity-0'}
              `}>
                  {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Stage */}
      <main className="flex-1 relative w-full h-full flex flex-col pt-28 pb-4 px-6 md:px-10">
        <div key={currentView} className="w-full h-full max-w-7xl mx-auto transition-all duration-500 ease-out">
            {renderView()}
        </div>
      </main>

    </div>
  );
};

export default App;