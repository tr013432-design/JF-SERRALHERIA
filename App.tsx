
import React, { useState } from 'react';
import { Project, Client, ProjectStatus, Interaction, InventoryItem, CalendarEvent } from './types';
import Dashboard from './components/Dashboard';
import QuoteBuilder from './components/QuoteBuilder';
import Pipeline from './components/Pipeline';
import ClientManager from './components/ClientManager';
import InventoryManager from './components/InventoryManager';
import CalendarManager from './components/CalendarManager';
import { LayoutDashboard, Users, FileText, Settings, ChevronLeft, ChevronRight, Menu, X, Package, Calendar as CalendarIcon } from 'lucide-react';
import { enviarNotificacao } from './services/telegramService';

function BotaoSalvar() {
  
  const handleSave = () => {
    // Lógica de salvar no banco...
    // ...
    
    // Envia o alerta
    enviarNotificacao("🛠️ *Novo serviço salvo!* O cliente João aprovou o orçamento.");
  };

  return <button onClick={handleSave}>Salvar Serviço</button>;
}

// MOCK DATA
const INITIAL_CLIENTS: Client[] = [
  { 
    id: '1', 
    name: 'Roberto Almeida', 
    phone: '(11) 99999-1234', 
    email: 'roberto@email.com', 
    address: 'Rua das Flores, 123',
    interactions: [
      { id: 'int1', date: '2023-10-20T10:00:00', type: 'Call', notes: 'Cliente interessado em portão automático.' },
      { id: 'int2', date: '2023-10-22T14:30:00', type: 'Whatsapp', notes: 'Enviado fotos de modelos de portão.' }
    ]
  },
  { 
    id: '2', 
    name: 'Construtora Souza', 
    phone: '(11) 98888-5678', 
    email: 'contato@souza.com', 
    address: 'Av. Industrial, 400',
    interactions: [
      { id: 'int3', date: '2023-10-15T09:00:00', type: 'Meeting', notes: 'Reunião presencial para medição da obra.' }
    ]
  },
  { 
    id: '3', 
    name: 'Maria Helena', 
    phone: '(11) 97777-9999', 
    email: 'maria@email.com', 
    address: 'Alameda Santos, 50',
    interactions: []
  },
];

const INITIAL_PROJECTS: Project[] = [
  { id: '101', clientId: '1', title: 'Portão Automático Basculante', description: 'Portão ferro galvanizado...', value: 4500, status: ProjectStatus.PRODUCTION, deadline: '2023-11-20', lastUpdate: '2023-10-25' },
  { id: '102', clientId: '2', title: 'Grade de Proteção Janelas', description: '10 unidades padrão...', value: 12000, status: ProjectStatus.NEW, deadline: '2023-12-01', lastUpdate: '2023-10-26' },
  { id: '103', clientId: '3', title: 'Corrimão Escada Interna', description: 'Aço inox...', value: 2800, status: ProjectStatus.COMPLETED, deadline: '2023-10-15', lastUpdate: '2023-10-15' },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'Barra Chata 1/2 x 1/8', category: 'Perfis', quantity: 50, minQuantity: 20, unit: 'br' },
  { id: '2', name: 'Eletrodo 2.5mm', category: 'Consumíveis', quantity: 2, minQuantity: 5, unit: 'cx' },
  { id: '3', name: 'Tinta Esmalte Preto', category: 'Pintura', quantity: 8, minQuantity: 3, unit: 'lt' },
  { id: '4', name: 'Disco de Corte 4.5"', category: 'Consumíveis', quantity: 15, minQuantity: 10, unit: 'un' },
];

const INITIAL_EVENTS: CalendarEvent[] = [
  { id: 'ev1', clientId: '1', title: 'Visita: Roberto Almeida', date: new Date().toISOString().split('T')[0], time: '14:00', type: 'TechnicalVisit', notes: 'Medir vão da garagem' },
  { id: 'ev2', clientId: '2', title: 'Instalação: Construtora Souza', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '09:00', type: 'Installation', notes: 'Levar equipe completa' }
];

type View = 'dashboard' | 'pipeline' | 'quotes' | 'clients' | 'inventory' | 'calendar';

// Professional Logo Component
const Logo = ({ collapsed = false }: { collapsed?: boolean }) => (
  <div className="flex items-center gap-3">
    <div className="relative w-10 h-10 flex-shrink-0">
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
        {/* Hexagon Base (Nut/Structure) - Dark Blue */}
        <path d="M50 5L93.3 30V80L50 105L6.7 80V30L50 5Z" fill="#1e293b" />
        {/* Inner I-Beam / J shape */}
        <path d="M35 30H65V40H55V65C55 70 52 72 48 72H40V82H48C58 82 65 75 65 65V30" fill="white" />
        {/* Spark / Flash - Orange */}
        <path d="M65 25L85 45L60 45L75 75L35 50L60 50L65 25Z" fill="#f97316" stroke="white" strokeWidth="2" />
      </svg>
    </div>
    {!collapsed && (
      <div className="flex flex-col justify-center overflow-hidden transition-all duration-300">
        <h1 className="font-bold text-lg leading-none tracking-tight text-white">
          JF <span className="text-orange-500">Serralheria</span>
        </h1>
        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Gestão Inteligente</p>
      </div>
    )}
  </div>
);

const App = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Handle Project Status Change
  const handleUpdateProjectStatus = (projectId: string, newStatus: ProjectStatus) => {
    setProjects(prev => prev.map(p => 
      p.id === projectId ? { ...p, status: newStatus, lastUpdate: new Date().toISOString() } : p
    ));
  };

  // Handle New Project from Quote
  const handleSaveProject = (projectData: Partial<Project>) => {
    const newProject: Project = {
      id: Math.random().toString(36).substr(2, 9),
      clientId: projectData.clientId!,
      title: projectData.title || 'Novo Projeto',
      description: projectData.description || '',
      value: projectData.value || 0,
      status: ProjectStatus.NEW,
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // +14 days default
      lastUpdate: new Date().toISOString(),
    };
    setProjects([...projects, newProject]);
    // Stay on quotes view to allow multiple entries
  };

  // Handle Add New Client
  const handleAddClient = (clientData: Omit<Client, 'id'>) => {
    const newClient: Client = {
      ...clientData,
      id: Math.random().toString(36).substr(2, 9),
      interactions: []
    };
    setClients(prev => [...prev, newClient]);
  };

  // Handle Delete Client
  const handleDeleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
  };

  // Handle Add Interaction
  const handleAddInteraction = (clientId: string, interactionData: Omit<Interaction, 'id'>) => {
    const newInteraction: Interaction = {
      ...interactionData,
      id: Math.random().toString(36).substr(2, 9)
    };

    setClients(prev => prev.map(client => {
      if (client.id === clientId) {
        return {
          ...client,
          interactions: [newInteraction, ...(client.interactions || [])]
        };
      }
      return client;
    }));
  };

  // Handle Inventory Actions
  const handleAddInventoryItem = (item: Omit<InventoryItem, 'id'>) => {
    const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
    setInventory([...inventory, newItem]);
  };

  const handleUpdateInventoryItem = (updatedItem: InventoryItem) => {
    setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const handleDeleteInventoryItem = (id: string) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  // Handle Calendar Events
  const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = { ...event, id: Math.random().toString(36).substr(2, 9) };
    setEvents([...events, newEvent]);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id));
  };

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsMobileSidebarOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
        currentView === view 
          ? 'bg-blue-600/10 text-blue-400 border-r-4 border-blue-500' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
      }`}
    >
      <Icon size={20} className={currentView === view ? 'text-blue-400' : 'group-hover:text-white transition-colors'} />
      <span className={`font-medium ${!isSidebarOpen && 'hidden md:hidden'}`}>{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed md:relative z-30 h-full bg-[#0f172a] text-white transition-all duration-300 flex flex-col shadow-xl
          ${isMobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
          ${isSidebarOpen ? 'md:w-72' : 'md:w-20'}
        `}
      >
        <div className={`p-5 flex items-center ${!isSidebarOpen && 'md:justify-center'}`}>
          <div className="flex items-center gap-3">
             <Logo collapsed={!isSidebarOpen && !isMobileSidebarOpen} />
             
            {/* Close button for mobile */}
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="md:hidden ml-auto text-slate-400 hover:text-white absolute right-4 top-6"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-1 md:space-y-2 mt-6">
          <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem view="pipeline" icon={FileText} label="Projetos" />
          <NavItem view="quotes" icon={Settings} label="Orçamentos" />
          <NavItem view="calendar" icon={CalendarIcon} label="Agenda" />
          <NavItem view="clients" icon={Users} label="Clientes" />
          <NavItem view="inventory" icon={Package} label="Estoque" />
        </nav>

        <div className="p-4 border-t border-slate-800/50">
          <div className={`flex flex-col ${!isSidebarOpen && 'md:items-center'}`}>
            <span className="text-[10px] md:text-xs text-slate-500 uppercase font-bold tracking-wider mb-1 md:mb-2">Desenvolvido por</span>
            {(isSidebarOpen || isMobileSidebarOpen) ? (
              <span className="text-xs md:text-sm font-semibold text-orange-400">Rodrigues Growth</span>
            ) : (
               <span className="text-xs font-bold text-orange-400">RGP</span>
            )}
          </div>
        </div>
        
        {/* Desktop Collapse Toggle */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-1/2 -right-3 bg-orange-500 text-white p-1.5 rounded-full shadow-lg hover:bg-orange-600 transition-colors hidden md:flex items-center justify-center border-2 border-slate-50"
        >
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between md:hidden flex-shrink-0 z-10 shadow-sm">
           <div className="flex items-center gap-2 scale-90 origin-left">
             <Logo collapsed={false} />
           </div>
           <button 
             onClick={() => setIsMobileSidebarOpen(true)} 
             className="text-slate-600 p-2 hover:bg-slate-100 rounded-lg"
           >
             <Menu size={24} />
           </button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-8 bg-slate-50 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            <header className="mb-4 md:mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-2 flex-shrink-0">
               <div>
                <h2 className="text-xl md:text-2xl font-bold text-slate-800">
                  {currentView === 'dashboard' && 'Visão Geral'}
                  {currentView === 'pipeline' && 'Gestão de Projetos'}
                  {currentView === 'quotes' && 'Gerador de Orçamentos'}
                  {currentView === 'clients' && 'Carteira de Clientes'}
                  {currentView === 'inventory' && 'Controle de Estoque'}
                  {currentView === 'calendar' && 'Visitas & Instalações'}
                </h2>
                <p className="text-slate-500 text-xs md:text-sm mt-0.5">Sistema de gestão JF Serralheria.</p>
               </div>
               <div className="text-xs md:text-sm text-slate-400 font-medium">
                 {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
               </div>
            </header>

            <div className="flex-1 min-h-0">
              {currentView === 'dashboard' && <Dashboard projects={projects} />}
              
              {currentView === 'pipeline' && (
                <Pipeline 
                  projects={projects} 
                  clients={clients} 
                  onUpdateStatus={handleUpdateProjectStatus}
                />
              )}
              
              {currentView === 'quotes' && (
                <QuoteBuilder 
                  clients={clients}
                  projects={projects} 
                  onSaveProject={handleSaveProject} 
                />
              )}
              
              {currentView === 'clients' && (
                <ClientManager 
                  clients={clients}
                  onAddClient={handleAddClient}
                  onDeleteClient={handleDeleteClient}
                  onAddInteraction={handleAddInteraction}
                />
              )}

              {currentView === 'inventory' && (
                <InventoryManager
                  inventory={inventory}
                  onAddItem={handleAddInventoryItem}
                  onUpdateItem={handleUpdateInventoryItem}
                  onDeleteItem={handleDeleteInventoryItem}
                />
              )}

              {currentView === 'calendar' && (
                <CalendarManager
                  events={events}
                  clients={clients}
                  onAddEvent={handleAddEvent}
                  onDeleteEvent={handleDeleteEvent}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
