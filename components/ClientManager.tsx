import React, { useState } from 'react';
import { Client, Interaction, InteractionType } from '../types';
import { UserPlus, Search, MapPin, Phone, Mail, X, Save, User, Trash2, AlertTriangle, Edit, History, MessageCircle, Calendar, Plus } from 'lucide-react';

interface ClientManagerProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id'>) => void;
  onDeleteClient: (clientId: string) => void;
  onAddInteraction?: (clientId: string, interaction: Omit<Interaction, 'id'>) => void;
}

const interactionConfig = {
  'Call': { icon: Phone, color: 'text-blue-500 bg-blue-50', label: 'Ligação' },
  'Email': { icon: Mail, color: 'text-purple-500 bg-purple-50', label: 'Email' },
  'Meeting': { icon: User, color: 'text-orange-500 bg-orange-50', label: 'Reunião' },
  'Whatsapp': { icon: MessageCircle, color: 'text-green-500 bg-green-50', label: 'WhatsApp' },
  'Note': { icon: Edit, color: 'text-slate-500 bg-slate-50', label: 'Nota' },
};

const ClientManager: React.FC<ClientManagerProps> = ({ clients, onAddClient, onDeleteClient, onAddInteraction }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  
  // History State
  const [selectedClientForHistory, setSelectedClientForHistory] = useState<Client | null>(null);
  const [newInteraction, setNewInteraction] = useState<{type: InteractionType, notes: string, date: string}>({
    type: 'Call',
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Client Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Nome e Telefone são obrigatórios');
      return;
    }
    
    onAddClient(formData);
    setFormData({ name: '', phone: '', email: '', address: '' });
    setIsFormOpen(false);
  };

  const confirmDelete = () => {
    if (clientToDelete) {
      onDeleteClient(clientToDelete.id);
      setClientToDelete(null);
    }
  };

  const handleSaveInteraction = () => {
    if (selectedClientForHistory && onAddInteraction && newInteraction.notes) {
      onAddInteraction(selectedClientForHistory.id, {
        type: newInteraction.type,
        notes: newInteraction.notes,
        date: newInteraction.date || new Date().toISOString()
      });
      // Reset form but keep modal open
      setNewInteraction({ type: 'Call', notes: '', date: new Date().toISOString().split('T')[0] });
    }
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6 h-full flex flex-col">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 md:gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 md:w-5 md:h-5" />
          <input 
            type="text" 
            placeholder="Buscar por nome, telefone ou email..." 
            className="w-full pl-10 pr-4 py-2 md:py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsFormOpen(!isFormOpen)}
          className={`flex items-center justify-center gap-2 px-4 py-2 md:py-2.5 rounded-lg font-medium transition-colors text-sm md:text-base ${
            isFormOpen 
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
          }`}
        >
          {isFormOpen ? <X size={18} /> : <UserPlus size={18} />}
          {isFormOpen ? 'Cancelar' : 'Novo Cliente'}
        </button>
      </div>

      {/* Add Client Form */}
      {isFormOpen && (
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-md border border-blue-100 animate-fade-in">
          <h3 className="text-base md:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <UserPlus size={20} className="text-blue-600" />
            Cadastrar Novo Cliente
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
              <div>
                <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Nome Completo *</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="Ex: João da Silva"
                  className="w-full border border-slate-200 rounded-lg p-2 md:p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp *</label>
                <input 
                  type="text" 
                  name="phone"
                  required
                  placeholder="Ex: (11) 99999-9999"
                  className="w-full border border-slate-200 rounded-lg p-2 md:p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder="Ex: joao@email.com"
                  className="w-full border border-slate-200 rounded-lg p-2 md:p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Endereço</label>
                <input 
                  type="text" 
                  name="address"
                  placeholder="Ex: Rua das Flores, 123"
                  className="w-full border border-slate-200 rounded-lg p-2 md:p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                type="submit"
                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Save size={18} />
                Salvar Cliente
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clients List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-4 text-xs md:text-sm font-semibold">Cliente</th>
                <th className="p-4 text-xs md:text-sm font-semibold">Contato</th>
                <th className="p-4 text-xs md:text-sm font-semibold">Localização</th>
                <th className="p-4 text-xs md:text-sm font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-slate-50 group transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs md:text-sm">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-sm md:text-base">{client.name}</p>
                          <p className="text-xs text-slate-400 md:hidden">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Phone size={14} className="text-slate-400" />
                          {client.phone}
                        </div>
                        {client.email && (
                          <div className="flex items-center gap-2 text-sm text-slate-500 hidden md:flex">
                            <Mail size={14} className="text-slate-400" />
                            {client.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{client.address || 'Não informado'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                           onClick={() => setSelectedClientForHistory(client)}
                           className="text-slate-400 hover:text-purple-600 p-1.5 rounded-lg hover:bg-purple-50 transition-colors" 
                           title="Histórico de Interações"
                         >
                           <History size={16} />
                         </button>
                         <button className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-blue-50 transition-colors" title="Editar">
                           <Edit size={16} />
                         </button>
                         <button 
                           onClick={() => setClientToDelete(client)}
                           className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                           title="Excluir"
                         >
                           <Trash2 size={16} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History Modal */}
      {selectedClientForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <History size={20} className="text-purple-600"/>
                Histórico: {selectedClientForHistory.name}
              </h3>
              <button 
                onClick={() => setSelectedClientForHistory(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 p-1 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100 bg-white">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Nova Interação</h4>
              <div className="grid grid-cols-2 gap-3 mb-3">
                 <div className="col-span-1">
                   <select 
                     className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-slate-50 focus:ring-2 focus:ring-purple-500 outline-none"
                     value={newInteraction.type}
                     onChange={(e) => setNewInteraction({...newInteraction, type: e.target.value as InteractionType})}
                   >
                     {Object.keys(interactionConfig).map(type => (
                       <option key={type} value={type}>{interactionConfig[type as InteractionType].label}</option>
                     ))}
                   </select>
                 </div>
                 <div className="col-span-1">
                   <input 
                      type="date"
                      className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-slate-50 focus:ring-2 focus:ring-purple-500 outline-none"
                      value={newInteraction.date}
                      onChange={(e) => setNewInteraction({...newInteraction, date: e.target.value})}
                   />
                 </div>
              </div>
              <textarea 
                className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-slate-50 focus:ring-2 focus:ring-purple-500 outline-none mb-3 resize-none h-20"
                placeholder="Descreva o que foi tratado..."
                value={newInteraction.notes}
                onChange={(e) => setNewInteraction({...newInteraction, notes: e.target.value})}
              />
              <button 
                onClick={handleSaveInteraction}
                disabled={!newInteraction.notes}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={16} />
                Registrar Interação
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              <div className="space-y-4">
                {(!selectedClientForHistory.interactions || selectedClientForHistory.interactions.length === 0) ? (
                  <div className="text-center py-8 text-slate-400">
                    <History size={40} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Nenhuma interação registrada.</p>
                  </div>
                ) : (
                  // Sort by date desc just to be safe, though App.tsx prepends
                  [...selectedClientForHistory.interactions]
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((interaction) => {
                      const config = interactionConfig[interaction.type];
                      const Icon = config.icon;
                      return (
                        <div key={interaction.id} className="relative pl-6 pb-2 last:pb-0">
                          {/* Timeline Line */}
                          <div className="absolute left-2.5 top-2 bottom-0 w-0.5 bg-slate-200 last:hidden"></div>
                          {/* Timeline Dot */}
                          <div className={`absolute left-0 top-1 w-5 h-5 rounded-full flex items-center justify-center bg-white border-2 border-slate-100 z-10`}>
                            <div className={`w-2 h-2 rounded-full ${config.color.split(' ')[0].replace('text-', 'bg-')}`}></div>
                          </div>

                          <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm ml-2">
                             <div className="flex justify-between items-start mb-1">
                               <div className="flex items-center gap-2">
                                  <div className={`p-1 rounded-md ${config.color}`}>
                                     <Icon size={12} />
                                  </div>
                                  <span className="font-bold text-slate-700 text-sm">{config.label}</span>
                               </div>
                               <span className="text-xs text-slate-400 flex items-center gap-1">
                                 <Calendar size={10} />
                                 {new Date(interaction.date).toLocaleDateString('pt-BR')}
                               </span>
                             </div>
                             <p className="text-xs md:text-sm text-slate-600 mt-1 whitespace-pre-wrap">
                               {interaction.notes}
                             </p>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {clientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
             <div className="p-6 text-center">
               <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <AlertTriangle size={24} className="text-red-600" />
               </div>
               <h3 className="text-lg font-bold text-slate-800 mb-2">Excluir Cliente?</h3>
               <p className="text-sm text-slate-600 mb-6">
                 Tem certeza que deseja remover <strong>{clientToDelete.name}</strong>? Esta ação não pode ser desfeita.
               </p>
               <div className="flex gap-3 justify-center">
                 <button 
                   onClick={() => setClientToDelete(null)}
                   className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors flex-1"
                 >
                   Cancelar
                 </button>
                 <button 
                   onClick={confirmDelete}
                   className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors flex-1"
                 >
                   Sim, Excluir
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManager;