import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart3, TrendingUp, Activity, Users, Zap, Clock, ShieldCheck, Target } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line, Legend } from 'recharts';

export default function Analytics() {
  const usageData = [
    { name: 'Mon', queries: 400, accuracy: 92 },
    { name: 'Tue', queries: 300, accuracy: 94 },
    { name: 'Wed', queries: 550, accuracy: 91 },
    { name: 'Thu', queries: 450, accuracy: 95 },
    { name: 'Fri', queries: 600, accuracy: 96 },
    { name: 'Sat', queries: 250, accuracy: 98 },
    { name: 'Sun', queries: 350, accuracy: 97 },
  ];

  const agentPerformanceData = [
    { name: 'Coding', successRate: 94, avgTime: 2.4, volume: 400 },
    { name: 'Research', successRate: 98, avgTime: 1.8, volume: 300 },
    { name: 'Writing', successRate: 96, avgTime: 1.5, volume: 300 },
    { name: 'Logic', successRate: 89, avgTime: 3.2, volume: 200 },
    { name: 'Critic', successRate: 99, avgTime: 0.8, volume: 278 },
    { name: 'Data', successRate: 92, avgTime: 2.1, volume: 189 },
  ];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-8">
      <header className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-cyan-500" />
            Agent Performance Analytics
          </h1>
          <p className="text-white/60 mt-2">Monitor system performance, agent utilization, and evolutionary learning metrics.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Queries Processed" value="12,450" icon={Activity} trend="+14% this week" color="text-cyan-400" />
        <MetricCard title="Average Accuracy Score" value="94.2%" icon={Target} trend="+2.1% from last month" color="text-emerald-400" />
        <MetricCard title="Avg. Response Time" value="1.2s" icon={Clock} trend="-0.3s improvement" color="text-indigo-400" />
        <MetricCard title="System Confidence" value="96.8%" icon={ShieldCheck} trend="+0.5% this week" color="text-violet-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-black/40 border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">System Utilization Trends</CardTitle>
            <CardDescription>Daily query volume over the past week.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="queries" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorQueries)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Agent Success Rate vs. Volume</CardTitle>
            <CardDescription>Comparing success rates across different specialized agents.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={agentPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} domain={[80, 100]} />
                <YAxis yAxisId="right" orientation="right" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }} />
                <Line yAxisId="left" type="monotone" dataKey="successRate" name="Success Rate (%)" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                <Line yAxisId="right" type="monotone" dataKey="volume" name="Task Volume" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-black/40 border-white/5 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Agent Execution Time Analysis</CardTitle>
            <CardDescription>Average response time (in seconds) per agent type.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
                <Bar dataKey="avgTime" name="Avg Time (s)" radius={[4, 4, 0, 0]}>
                  {agentPerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, color }: any) {
  return (
    <Card className="bg-black/40 border-white/5">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white/60 mb-1">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight">{value}</h3>
          <p className={`text-xs mt-2 font-medium ${color}`}>{trend}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  );
}
