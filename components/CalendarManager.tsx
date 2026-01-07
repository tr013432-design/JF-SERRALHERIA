
import React, { useState } from 'react';
import { CalendarEvent, Client, EventType } from '../types';
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, Calendar as CalendarIcon, X, User, Trash2 } from 'lucide-react';

interface CalendarManagerProps {
  events: CalendarEvent[];
  clients: Client[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onDeleteEvent: (id: string) => void;
}

const CalendarManager: React.FC<CalendarManagerProps> = ({ events, clients, onAddEvent, onDeleteEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDateForEvent, setSelectedDateForEvent] = useState<string>('');

  const [formData, setFormData] = useState<{
    clientId: string;
    title: string;
    time: string;
    type: EventType;
    notes: string;
  }>({
    clientId: '',
    title: '',
    time: '09:00',
    type: 'TechnicalVisit',
    notes: ''
  });

  // Calendar Navigation
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Calendar Logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0 = Sunday

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
  };

  const handleDayClick = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDateForEvent(dateStr);
    setFormData(prev => ({ ...prev, title: '' })); // Reset title
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) {
      alert('Selecione um cliente');
      return;
    }

    const clientName = clients.find(c => c.id === formData.clientId)?.name || 'Cliente';
    // Auto-generate title if empty based on type
    const title = formData.title || (formData.type === 'TechnicalVisit' ? `Visita: ${clientName}` : `Instalação: ${clientName}`);

    onAddEvent({
      ...formData,
      title,
      date: selectedDateForEvent
    });

    setIsModalOpen(false);
    setFormData({
      clientId: '',
      title: '',
      time: '09:00',
      type: 'TechnicalVisit',
      notes: ''
    });
  };

  const eventTypeColors = {
    'TechnicalVisit': 'bg-blue-100 text-blue-700 border-blue-200',
    'Installation': 'bg-orange-100 text-orange-700 border-orange-200'
  };

  const eventTypeLabels = {
    'TechnicalVisit': 'Visita Técnica',
    'Installation': 'Instalação'
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
            <CalendarIcon className="text-blue-600" />
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-slate-600">Visita Técnica</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-slate-600">Instalação</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(day => (
            <div key={day} className="py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{day.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {emptyDays.map(d => (
            <div key={`empty-${d}`} className="bg-slate-50/50 border-r border-b border-slate-100"></div>
          ))}
          
          {daysArray.map(day => {
            const dayEvents = getEventsForDay(day);
            const isToday = 
              day === new Date().getDate() && 
              currentDate.getMonth() === new Date().getMonth() && 
              currentDate.getFullYear() === new Date().getFullYear();

            return (
              <div 
                key={day} 
                onClick={() => handleDayClick(day)}
                className={`min-h-[100px] border-r border-b border-slate-100 p-2 transition-colors hover:bg-slate-50 cursor-pointer relative group ${isToday ? 'bg-blue-50/30' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                   <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                     {day}
                   </span>
                   <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity">
                     <Plus size={16} />
                   </button>
                </div>
                
                <div className="space-y-1">
                  {dayEvents.map(event => (
                    <div 
                      key={event.id}
                      className={`text-xs p-1.5 rounded-md border mb-1 truncate shadow-sm hover:shadow-md transition-shadow ${eventTypeColors[event.type]}`}
                      title={`${event.time} - ${event.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Ideally open edit/view details modal here
                        if(confirm(`Excluir ${event.title}?`)) onDeleteEvent(event.id);
                      }}
                    >
                      <span className="font-bold mr-1">{event.time}</span>
                      {event.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <CalendarIcon size={20} className="text-blue-600" />
                Agendar Visita
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Data Selecionada</label>
                <div className="bg-slate-100 p-2 rounded-lg text-slate-600 font-medium text-sm flex items-center gap-2">
                  <CalendarIcon size={16} />
                  {new Date(selectedDateForEvent).toLocaleDateString('pt-BR', { dateStyle: 'full' })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cliente</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select 
                    required
                    className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
                    value={formData.clientId}
                    onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tipo</label>
                    <select 
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value as EventType})}
                    >
                      <option value="TechnicalVisit">Visita Técnica</option>
                      <option value="Installation">Instalação</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Horário</label>
                    <div className="relative">
                      <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="time" 
                        required
                        className="w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        value={formData.time}
                        onChange={(e) => setFormData({...formData, time: e.target.value})}
                      />
                    </div>
                 </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="Ex: Medir portão da frente"
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Observações</label>
                <textarea 
                  rows={3}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Detalhes adicionais..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-md flex items-center justify-center gap-2 mt-2"
              >
                <Plus size={18} />
                Agendar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarManager;
