import React from 'react';
import { Project, ProjectStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Wallet, Hammer, Users, Clock } from 'lucide-react';

interface DashboardProps {
  projects: Project[];
}

const KPICard = ({ title, value, icon: Icon, color }: { title: string, value: string, icon: any, color: string }) => (
  <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-3 md:space-x-4">
    <div className={`p-2 md:p-3 rounded-full ${color} bg-opacity-10 flex-shrink-0`}>
      <Icon className={`w-5 h-5 md:w-6 md:h-6 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div className="min-w-0">
      <p className="text-xs md:text-sm text-slate-500 font-medium truncate">{title}</p>
      <h3 className="text-xl md:text-2xl font-bold text-slate-800 truncate">{value}</h3>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ projects }) => {
  const totalRevenue = projects.reduce((acc, p) => acc + p.value, 0);
  const activeProjects = projects.filter(p => p.status !== ProjectStatus.COMPLETED && p.status !== ProjectStatus.NEW).length;
  const completedProjects = projects.filter(p => p.status === ProjectStatus.COMPLETED).length;

  // 1. Status Chart Data Preparation
  const statusCounts = projects.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusChartData = Object.keys(ProjectStatus).map((key) => {
    const statusValue = ProjectStatus[key as keyof typeof ProjectStatus];
    return {
      name: statusValue,
      count: statusCounts[statusValue] || 0,
    };
  });

  const statusColors = ['#94a3b8', '#38bdf8', '#fbbf24', '#f87171', '#4ade80'];

  // 2. Project Value Chart Data Preparation (New Feature)
  const projectValueData = [...projects]
    .sort((a, b) => b.value - a.value) // Sort descending by value
    .map(project => ({
      name: project.title.length > 15 ? project.title.substring(0, 15) + '...' : project.title,
      fullTitle: project.title,
      value: project.value
    }));

  // Vibrant color palette for the new chart
  const vibrantColors = ['#8b5cf6', '#ec4899', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-lg rounded-lg z-50">
          <p className="font-semibold text-slate-700 text-sm">{payload[0].payload.fullTitle}</p>
          <p className="text-blue-600 font-bold text-sm">
            R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in pb-4 md:pb-8">
      {/* KPI Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <KPICard 
          title="Receita" 
          value={`R$ ${(totalRevenue/1000).toFixed(1)}k`} 
          icon={Wallet} 
          color="bg-emerald-500" 
        />
        <KPICard 
          title="Em Produção" 
          value={activeProjects.toString()} 
          icon={Hammer} 
          color="bg-blue-500" 
        />
        <KPICard 
          title="Total" 
          value={projects.length.toString()} 
          icon={Users} 
          color="bg-indigo-500" 
        />
        <KPICard 
          title="Entregues" 
          value={completedProjects.toString()} 
          icon={Clock} 
          color="bg-slate-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Status Chart */}
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-base md:text-lg font-bold text-slate-800 mb-4">Projetos por Status</h3>
          <div className="h-56 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} interval={0} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} allowDecimals={false} />
                <Tooltip 
                  cursor={{fill: '#f1f5f9'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px'}}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={statusColors[index % statusColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-base md:text-lg font-bold text-slate-800 mb-4">Atividade Recente</h3>
          <div className="space-y-3 md:space-y-4">
            {projects.slice(0, 4).map((project) => (
              <div key={project.id} className="flex items-center space-x-3 pb-3 border-b border-slate-50 last:border-0 last:pb-0">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                <div className="overflow-hidden min-w-0 flex-1">
                  <p className="text-xs md:text-sm font-medium text-slate-700 truncate">{project.title}</p>
                  <p className="text-[10px] md:text-xs text-slate-500 truncate">{project.status} - {new Date(project.lastUpdate).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="ml-auto text-xs font-semibold text-slate-600 whitespace-nowrap">
                  R$ {project.value.toLocaleString('pt-BR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NEW: Project Value Chart */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-bold text-slate-800">Ranking de Valor</h3>
        </div>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectValueData} margin={{ top: 20, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 10}} 
                dy={10} 
                interval={0}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#64748b', fontSize: 10}} 
                tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} animationDuration={1500}>
                {projectValueData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={vibrantColors[index % vibrantColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
