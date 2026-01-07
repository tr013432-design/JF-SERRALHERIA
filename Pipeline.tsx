import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus, Client } from '../types';
import { Clock, CheckCircle2, Ruler, Hammer, Filter, Calendar, User, X, Eye, EyeOff } from 'lucide-react';

interface PipelineProps {
  projects: Project[];
  clients: Client[];
  onUpdateStatus: (projectId: string, newStatus: ProjectStatus) => void;
}

const statusConfig = {
  [ProjectStatus.NEW]: { color: 'bg-slate-100 border-slate-200', icon: Clock, label: 'Novos' },
  [ProjectStatus.MEASUREMENT]: { color: 'bg-blue-50 border-blue-200', icon: Ruler, label: 'Medição' },
  [ProjectStatus.PRODUCTION]: { color: 'bg-orange-50 border-orange-200', icon: Hammer, label: 'Produção' },
  [ProjectStatus.INSTALLATION]: { color: 'bg-indigo-50 border-indigo-200', icon: Hammer, label: 'Instalação' },
  [ProjectStatus.COMPLETED]: { color: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2, label: 'Finalizado' },
};

const Pipeline: React.FC<PipelineProps> = ({ projects, clients, onUpdateStatus }) => {
  const [clientFilter, setClientFilter] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | null>(null);

  const getClientName = (id: string) => clients.find(c => c.id === id)?.name || 'Cliente Desconhecido';

  // Filter Logic
  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      // 1. Filter by Client
      if (clientFilter && project.clientId !== clientFilter) {
        return false;
      }

      // 2. Filter by Date Range (Last Update)
      if (dateRange !== 'all') {
        const projectDate = new Date(project.lastUpdate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - projectDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (dateRange === '7' && diffDays > 7) return false;
        if (dateRange === '30' && diffDays > 30) return false;
        if (dateRange === '90' && diffDays > 90) return false;
      }

      // 3. Filter by Status (Column Filter) - Optional, mainly handled by column rendering logic
      // but added here for consistency if we want to show strict counts
      if (statusFilter && project.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [projects, clientFilter, dateRange, statusFilter]);

  const clearFilters = () => {
    setClientFilter('');
    setDateRange('all');
    setStatusFilter(null);
  };

  const toggleStatusFilter = (status: ProjectStatus) => {
    if (statusFilter === status) {
      setStatusFilter(null);
    } else {
      setStatusFilter(status);
    }
  };

  const hasActiveFilters = clientFilter !== '' || dateRange !== 'all' || statusFilter !== null;

  // Determine which columns to show
  const visibleStatuses = statusFilter 
    ? [statusFilter] 
    : Object.values(ProjectStatus);

  return (
    <div className="flex flex-col h-[calc(100dvh-130px)] md:h-[calc(100vh-140px)]">
      {/* Filter Bar */}
      <div className="mb-3 bg-white p-2 md:p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-2 md:gap-3 md:items-center flex-shrink-0">
        <div className="flex items-center justify-between md:justify-start">
          <div className="flex items-center gap-2 text-slate-500 font-medium text-xs md:text-sm">
            <Filter size={14} />
            <span>Filtrar:</span>
          </div>
          {/* Mobile Clear Button placed here to save space */}
          {hasActiveFilters && (
            <button 
              onClick={clearFilters}
              className="md:hidden flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 bg-red-50 rounded-md"
            >
              <X size={12} />
              Limpar
            </button>
          )}
        </div>

        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {/* Client Filter */}
          <div className="relative min-w-[140px] flex-1 md:flex-none">
            <User size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full pl-8 pr-6 py-1.5 md:py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-slate-300 transition-colors cursor-pointer appearance-none md:min-w-[180px]"
            >
              <option value="">Clientes (Todos)</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative min-w-[130px] flex-1 md:flex-none">
            <Calendar size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full pl-8 pr-6 py-1.5 md:py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-slate-300 transition-colors cursor-pointer appearance-none"
            >
              <option value="all">Datas (Todas)</option>
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 3 meses</option>
            </select>
          </div>
        </div>

        {/* Desktop Clear Filters Button */}
        {hasActiveFilters && (
          <button 
            onClick={clearFilters}
            className="hidden md:flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium px-2 py-1 ml-auto"
          >
            <X size={14} />
            Limpar
          </button>
        )}

        <div className="md:ml-auto text-[10px] md:text-xs text-slate-400 font-medium hidden md:block">
          {filteredProjects.length} projetos
          {statusFilter && <span className="ml-1 text-blue-500">(Filtro Status Ativo)</span>}
        </div>
      </div>

      {/* Kanban Board */}
      <div className={`flex-1 flex gap-3 md:gap-4 overflow-x-auto pb-2 min-h-0 snap-x snap-mandatory md:snap-none ${statusFilter ? 'justify-center md:justify-start' : ''}`}>
        {visibleStatuses.map((status) => {
          const config = statusConfig[status as ProjectStatus];
          const statusProjects = filteredProjects.filter(p => p.status === status);
          const Icon = config.icon;
          const isActive = statusFilter === status;

          return (
            <div 
              key={status} 
              className={`snap-center flex-shrink-0 flex flex-col bg-slate-100 rounded-xl p-2 md:p-3 h-full max-h-full transition-all duration-300 ${statusFilter ? 'w-full md:w-[400px]' : 'min-w-[260px] w-[260px] md:min-w-[280px] md:w-[320px]'}`}
            >
              <div 
                onClick={() => toggleStatusFilter(status as ProjectStatus)}
                className={`flex items-center gap-2 mb-2 md:mb-3 p-2 rounded-lg cursor-pointer transition-all hover:brightness-95 group ${config.color.split(' ')[0]} ${isActive ? 'ring-2 ring-offset-1 ring-blue-400' : ''}`}
                title={isActive ? "Clique para ver todas as colunas" : "Clique para focar nesta coluna"}
              >
                <Icon size={16} className="text-slate-700" />
                <h3 className="font-semibold text-slate-700 text-xs md:text-sm uppercase tracking-wide truncate">{config.label}</h3>
                <span className="ml-auto bg-white px-1.5 py-0.5 rounded-full text-[10px] font-bold text-slate-500 shadow-sm">
                  {statusProjects.length}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                   {isActive ? <EyeOff size={14} className="text-slate-500"/> : <Eye size={14} className="text-slate-500"/>}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 md:space-y-3 custom-scrollbar pr-1">
                {statusProjects.length === 0 ? (
                  <div className="h-20 md:h-24 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-lg">
                    <span className="text-[10px] md:text-xs text-slate-400 font-medium">Vazio</span>
                  </div>
                ) : (
                  statusProjects.map(project => (
                    <div key={project.id} className="bg-white p-3 md:p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group relative">
                      <div className="flex justify-between items-start mb-1 md:mb-2">
                        <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {project.id.slice(0,4).toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(project.lastUpdate).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit'})}
                        </span>
                      </div>
                      
                      <h4 className="font-bold text-slate-800 text-sm mb-0.5 line-clamp-2">{project.title}</h4>
                      <p className="text-xs text-slate-500 mb-2 truncate">
                        {getClientName(project.clientId)}
                      </p>
                      
                      <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                        <span className="font-bold text-slate-700 text-xs md:text-sm">
                          R$ {project.value.toLocaleString('pt-BR')}
                        </span>
                        
                        <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                           {status !== ProjectStatus.COMPLETED && (
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 const statuses = Object.values(ProjectStatus);
                                 const currentIndex = statuses.indexOf(status as ProjectStatus);
                                 if (currentIndex < statuses.length - 1) {
                                   onUpdateStatus(project.id, statuses[currentIndex + 1]);
                                 }
                               }}
                               className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-1 md:p-1.5 rounded"
                               title="Avançar etapa"
                             >
                               <span className="text-xs">→</span>
                             </button>
                           )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pipeline;