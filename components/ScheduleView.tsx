'use client';
import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Truck, AlertOctagon, Navigation, Clock, Calendar, Filter, ChevronDown, Sparkles, Bot, User, Send } from 'lucide-react';
import { Message } from '../types';

interface ScheduleViewProps {
  input: string;
  setInput: (value: string) => void;
  onCommand: (e: React.FormEvent) => void;
  isAiThinking: boolean;
  messages: Message[];
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ input, setInput, onCommand, isAiThinking, messages }) => {
  const [selectedRoute, setSelectedRoute] = useState('All Routes');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="h-full w-full flex flex-col md:flex-row gap-6 animate-scale-in">
      
      {/* Immersive Map Area */}
      <div className="flex-1 bg-white rounded-[2.5rem] relative overflow-hidden shadow-sm border border-white/50 group flex flex-col">
          
          {/* Map Filters Overlay */}
          <div className="absolute top-6 left-6 right-6 z-20 flex flex-col sm:flex-row justify-between gap-4 pointer-events-none">
              <div className="flex gap-2 pointer-events-auto">
                  <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-black/5 flex items-center gap-2">
                      <button className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium shadow-sm flex items-center gap-2 hover:bg-slate-800 transition-colors">
                          <Calendar size={14} />
                          <span>Today, Oct 24</span>
                          <ChevronDown size={12} className="opacity-50" />
                      </button>
                      <button className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-subtle transition-colors">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mx-0.5" />
                      </button>
                  </div>
              </div>

              <div className="flex gap-2 pointer-events-auto">
                  <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-black/5 flex items-center">
                       <div className="flex items-center gap-2 px-3 border-r border-slate-200 mr-2">
                           <Filter size={14} className="text-subtle" />
                           <span className="text-xs font-bold text-subtle uppercase tracking-wider">Filter</span>
                       </div>
                       <select 
                           value={selectedRoute}
                           onChange={(e) => setSelectedRoute(e.target.value)}
                           className="bg-transparent text-sm font-medium text-primary focus:outline-none cursor-pointer pr-2 py-1"
                       >
                           <option>All Routes</option>
                           <option>Truck 104 - Downtown</option>
                           <option>Van 202 - Riverside</option>
                           <option>Priority Deliveries</option>
                       </select>
                  </div>
              </div>
          </div>

          {/* Stylized Map Background */}
          <div className="absolute inset-0 bg-[#eef2f6]">
             <svg width="100%" height="100%" className="opacity-20">
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                    <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
             </svg>
             {/* Decorative Map blobs */}
             <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl" />
             <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
          </div>

          {/* Interactive Route Line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
             <path 
                d="M 150 150 C 300 150, 400 400, 700 350" 
                fill="none" 
                stroke="#cbd5e1" 
                strokeWidth="4" 
                strokeLinecap="round" 
             />
             <path 
                d="M 150 150 C 300 150, 400 400, 700 350" 
                fill="none" 
                stroke="#3b82f6" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeDasharray="10 10"
                className="animate-[dash_30s_linear_infinite]"
             />
          </svg>

          {/* Floating Markers */}
          <div className="absolute top-[130px] left-[130px] z-10 group/marker cursor-pointer">
              <div className="w-4 h-4 bg-primary rounded-full ring-4 ring-white shadow-lg group-hover/marker:scale-125 transition-transform" />
              <div className="absolute left-6 top-0 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl shadow-lg border border-white/20 opacity-0 group-hover/marker:opacity-100 transition-opacity -translate-x-2 group-hover/marker:translate-x-0 w-max">
                  <div className="text-xs font-bold text-primary">Warehouse HQ</div>
                  <div className="text-[10px] text-subtle">Dep 08:00 AM</div>
              </div>
          </div>

          <div className="absolute top-[380px] left-[380px] z-10 group/marker cursor-pointer">
              <div className="relative">
                 <div className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center text-accent z-20 relative animate-float">
                    <Truck size={18} />
                 </div>
                 <div className="absolute inset-0 bg-accent/20 rounded-full animate-ping z-10" />
              </div>
              <div className="absolute left-12 top-0 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-xl border border-white/20 w-48">
                  <div className="flex justify-between items-center mb-1">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider">Unit 104</div>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  <div className="text-sm font-medium text-primary mb-1">En Route: Downtown</div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-accent w-[65%] h-full rounded-full" />
                  </div>
                  <div className="flex justify-between text-[10px] text-subtle mt-1">
                      <span>45m rem</span>
                      <span>On Time</span>
                  </div>
              </div>
          </div>

          <div className="absolute top-[330px] right-[20%] z-10 group/marker cursor-pointer">
              <div className="w-4 h-4 bg-red-500 rounded-full ring-4 ring-white shadow-lg group-hover/marker:scale-125 transition-transform" />
              <div className="absolute right-6 top-0 bg-white/90 backdrop-blur px-3 py-2 rounded-xl shadow-lg border border-white/20 w-max flex gap-3 items-center">
                  <div className="bg-red-100 p-1.5 rounded-lg text-red-600">
                    <AlertOctagon size={14} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-primary">Traffic Alert</div>
                    <div className="text-[10px] text-subtle">+15m Delay Expectancy</div>
                  </div>
              </div>
          </div>
      </div>

      {/* Right Column: Info & Chat */}
      <div className="w-full md:w-80 flex flex-col gap-4">
          
          {/* Top Panel: Live Route Information */}
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 p-6 rounded-[2rem] shadow-sm flex-1 max-h-[50%] overflow-y-auto no-scrollbar">
             <h2 className="text-2xl font-light text-primary mb-6">Live Route</h2>
             
             <div className="space-y-6">
                <div className="relative pl-6 border-l-2 border-dashed border-slate-300">
                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-slate-300 rounded-full ring-4 ring-white" />
                    <p className="text-xs text-subtle uppercase tracking-wider mb-1">08:00 AM</p>
                    <h4 className="text-sm font-medium text-primary">Depart Warehouse</h4>
                </div>
                
                <div className="relative pl-6 border-l-2 border-accent">
                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-accent rounded-full ring-4 ring-white" />
                    <p className="text-xs text-accent font-semibold uppercase tracking-wider mb-1">Current Leg</p>
                    <h4 className="text-lg font-medium text-primary">Transit to Downtown</h4>
                    <div className="flex items-center gap-2 mt-2 text-xs text-subtle bg-white p-2 rounded-lg shadow-sm w-max">
                        <Navigation size={12} />
                        <span>I-95 South • 45mi</span>
                    </div>
                </div>

                <div className="relative pl-6 border-l-2 border-dashed border-slate-300 opacity-60">
                    <div className="absolute -left-[5px] top-0 w-2.5 h-2.5 bg-slate-300 rounded-full ring-4 ring-white" />
                    <p className="text-xs text-subtle uppercase tracking-wider mb-1">10:30 AM (Est)</p>
                    <h4 className="text-sm font-medium text-primary">Downtown Loft Load-in</h4>
                </div>
             </div>
          </div>

          {/* Bottom Panel: AI Chat (Replaces Efficiency) */}
          <div className="flex-1 glass-panel bg-primary text-white backdrop-blur-xl border border-white/10 rounded-[2rem] p-5 shadow-lg flex flex-col relative overflow-hidden">
              
             <div className="flex items-center gap-2 mb-3 z-10 border-b border-white/10 pb-3">
                <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                    <Sparkles size={12} className="text-white" />
                </div>
                <h3 className="text-sm font-medium">Route Assistant</h3>
             </div>

             {/* Chat History */}
             <div ref={scrollRef} className="flex-1 overflow-y-auto mb-3 space-y-3 pr-1 no-scrollbar z-10">
                 {messages.length === 1 && (
                     <div className="text-center text-white/40 text-xs mt-4">
                         Ask about traffic, delays, or alternative routes...
                     </div>
                 )}
                 {messages.filter(m => m.action === 'SCHEDULE' || m.role === 'user').slice(-4).map((msg) => (
                     <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                         <div className={`
                             p-2.5 rounded-xl text-xs leading-relaxed
                             ${msg.role === 'user' 
                                ? 'bg-white text-primary rounded-tr-none' 
                                : 'bg-white/10 text-white/90 rounded-tl-none'}
                         `}>
                             {msg.content}
                         </div>
                     </div>
                 ))}
                 {isAiThinking && (
                     <div className="flex gap-2">
                         <div className="bg-white/10 px-3 py-2 rounded-xl rounded-tl-none">
                             <div className="flex gap-1">
                                 <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
                                 <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
                                 <div className="w-1 h-1 bg-white/60 rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
                             </div>
                         </div>
                     </div>
                 )}
             </div>

             {/* Input Area */}
             <form onSubmit={onCommand} className="relative z-10 mt-auto">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask AI..."
                    className="w-full bg-white/10 border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:bg-white/20 transition-all"
                />
                <button 
                    type="submit"
                    disabled={!input.trim() || isAiThinking}
                    className="absolute right-1.5 top-1.5 p-1.5 bg-white text-primary rounded-md hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={10} />
                </button>
             </form>
          </div>
      </div>
    </div>
  );
};

