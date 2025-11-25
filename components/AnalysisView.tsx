'use client';
import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Activity, Zap } from 'lucide-react';

const data = [
  { name: 'Mon', cost: 2400, load: 40 },
  { name: 'Tue', cost: 1398, load: 30 },
  { name: 'Wed', cost: 9800, load: 85 },
  { name: 'Thu', cost: 3908, load: 50 },
  { name: 'Fri', cost: 4800, load: 60 },
  { name: 'Sat', cost: 3800, load: 45 },
  { name: 'Sun', cost: 4300, load: 55 },
];

export const AnalysisView: React.FC = () => {
  return (
    <div className="h-full w-full flex flex-col animate-slide-up space-y-6">
      
      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
              { label: 'Weekly Savings', value: '$12,405', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10' },
              { label: 'Route Efficiency', value: '94.2%', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { label: 'Active Fleet', value: '18/20', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' }
          ].map((kpi, i) => (
              <div key={i} className="glass-panel bg-white/60 p-6 rounded-3xl flex items-center justify-between transition-transform hover:-translate-y-1 duration-300">
                  <div>
                      <p className="text-sm text-subtle font-medium mb-1">{kpi.label}</p>
                      <h3 className="text-3xl font-light text-primary tracking-tight">{kpi.value}</h3>
                  </div>
                  <div className={`p-4 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                      <kpi.icon size={24} />
                  </div>
              </div>
          ))}
      </div>

      {/* Main Chart Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
          
          <div className="lg:col-span-2 glass-panel bg-white/70 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden">
              <div className="flex justify-between items-center mb-8 z-10">
                  <h3 className="text-xl font-medium text-primary">Cost Analysis</h3>
                  <div className="flex gap-2">
                      {['D', 'W', 'M'].map(t => (
                          <button key={t} className="w-8 h-8 rounded-full text-xs font-bold text-subtle hover:bg-white hover:shadow-sm transition-all">{t}</button>
                      ))}
                  </div>
              </div>
              <div className="flex-1 w-full min-h-[200px] z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <Tooltip 
                            cursor={{fill: '#f1f5f9', radius: 8}}
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} 
                        />
                        <Bar dataKey="cost" fill="#0f172a" radius={[8, 8, 8, 8]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Decorative background element */}
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-slate-200/50 rounded-full blur-3xl pointer-events-none" />
          </div>

          <div className="glass-panel bg-white/70 rounded-[2.5rem] p-8 flex flex-col">
               <h3 className="text-xl font-medium text-primary mb-2">Load Capacity</h3>
               <p className="text-sm text-subtle mb-6">Average fleet utilization</p>
               
               <div className="flex-1 w-full min-h-[200px]">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} 
                        />
                        <Area type="monotone" dataKey="load" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorLoad)" />
                    </AreaChart>
                 </ResponsiveContainer>
               </div>
          </div>

      </div>
    </div>
  );
};

