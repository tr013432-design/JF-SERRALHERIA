import React, { useState, useEffect, useRef } from 'react';
import { InventoryItem } from '../types';
import { Package, Search, Plus, Trash2, AlertTriangle, ArrowDown, ArrowUp, BellRing, Edit, Save, X, FileText, Copy, Check } from 'lucide-react';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
  onUpdateItem: (item: InventoryItem) => void;
  onDeleteItem: (itemId: string) => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ inventory, onAddItem, onUpdateItem, onDeleteItem }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [copied, setCopied] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const hasPlayedSound = useRef(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: 0,
    minQuantity: 0,
    unit: 'un'
  });

  const lowStockCount = inventory.filter(i => i.quantity <= i.minQuantity).length;

  // Sound Alert Logic
  useEffect(() => {
    if (lowStockCount > 0 && !hasPlayedSound.current) {
      playAlertSound();
      hasPlayedSound.current = true;
    } else if (lowStockCount === 0) {
      hasPlayedSound.current = false;
    }
  }, [lowStockCount]);

  const playAlertSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      const now = ctx.currentTime;
      
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.frequency.setValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.05, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch (e) {
      console.error("Audio autoplay blocked or failed", e);
    }
  };

  const handleGenerateReport = () => {
    const date = new Date().toLocaleDateString('pt-BR');
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    let text = `📋 *RELATÓRIO DE ESTOQUE - JF SERRALHERIA*\n`;
    text += `📅 Data: ${date} às ${time}\n\n`;
    
    text += `📊 *RESUMO*\n`;
    text += `- Total de Itens: ${inventory.length}\n`;
    text += `- Itens Críticos: ${lowStockCount}\n`;
    text += `-----------------------------------\n\n`;

    const lowStockItems = inventory.filter(i => i.quantity <= i.minQuantity);
    
    if (lowStockItems.length > 0) {
      text += `🚨 *ATENÇÃO - ESTOQUE BAIXO*\n`;
      lowStockItems.forEach(i => {
        text += `[ ] ${i.name.toUpperCase()}\n`;
        text += `    Qtd: ${i.quantity} ${i.unit} (Mín: ${i.minQuantity})\n`;
      });
      text += `\n-----------------------------------\n\n`;
    }

    text += `📦 *LISTA GERAL*\n`;
    // Sort by name
    const sortedInventory = [...inventory].sort((a, b) => a.name.localeCompare(b.name));
    
    sortedInventory.forEach(i => {
       const status = i.quantity <= i.minQuantity ? '🔴' : '🟢';
       text += `${status} ${i.name} (${i.category})\n`;
       text += `    Saldo: ${i.quantity} ${i.unit}\n`;
    });

    setReportText(text);
    setIsReportOpen(true);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'quantity' || name === 'minQuantity' ? Number(value) : value 
    }));
  };

  const handleEditClick = (item: InventoryItem) => {
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      minQuantity: item.minQuantity,
      unit: item.unit
    });
    setEditingId(item.id);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setFormData({ name: '', category: '', quantity: 0, minQuantity: 0, unit: 'un' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    
    if (editingId) {
      onUpdateItem({ ...formData, id: editingId });
    } else {
      onAddItem(formData);
    }
    
    handleCloseForm();
  };

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6 h-full flex flex-col">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-3">
          <div className="p-2 md:p-3 rounded-full bg-blue-100 text-blue-600">
            <Package size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total de Itens</p>
            <h3 className="text-lg md:text-xl font-bold text-slate-800">{inventory.length}</h3>
          </div>
        </div>
        <div className={`bg-white p-4 rounded-xl shadow-sm border flex items-center space-x-3 transition-colors ${lowStockCount > 0 ? 'border-red-200 bg-red-50' : 'border-slate-100'}`}>
          <div className={`p-2 md:p-3 rounded-full ${lowStockCount > 0 ? 'bg-red-200 text-red-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'}`}>
            {lowStockCount > 0 ? <BellRing size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div>
            <p className={`text-xs font-medium ${lowStockCount > 0 ? 'text-red-600' : 'text-slate-500'}`}>
              Estoque Baixo
            </p>
            <h3 className={`text-lg md:text-xl font-bold ${lowStockCount > 0 ? 'text-red-700' : 'text-slate-800'}`}>{lowStockCount}</h3>
          </div>
        </div>
      </div>

      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-3 md:gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 md:w-5 md:h-5" />
          <input 
            type="text" 
            placeholder="Buscar material..." 
            className="w-full pl-10 pr-4 py-2 md:py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleGenerateReport}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 md:py-2.5 rounded-lg font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-all text-sm md:text-base"
          >
            <FileText size={18} />
            Relatório
          </button>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 md:py-2.5 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all text-sm md:text-base"
          >
            <Plus size={18} />
            Novo Item
          </button>
        </div>
      </div>

      {/* Add/Edit Item Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                {editingId ? <Edit size={20} className="text-blue-500" /> : <Plus size={20} className="text-blue-500" />}
                {editingId ? 'Editar Material' : 'Adicionar Material'}
              </h3>
              <button onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nome do Material</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Categoria</label>
                <input 
                  type="text" 
                  name="category"
                  placeholder="Ex: Perfis, Chapas, Consumíveis"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qtd Atual</label>
                  <input 
                    type="number" 
                    name="quantity"
                    min="0"
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.quantity}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Unidade</label>
                  <select 
                    name="unit"
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.unit}
                    onChange={handleInputChange}
                  >
                    <option value="un">Unidade (un)</option>
                    <option value="m">Metros (m)</option>
                    <option value="kg">Quilos (kg)</option>
                    <option value="lt">Litros (l)</option>
                    <option value="cx">Caixa (cx)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Estoque Mínimo (Alerta)</label>
                <input 
                  type="number" 
                  name="minQuantity"
                  min="0"
                  className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.minQuantity}
                  onChange={handleInputChange}
                />
              </div>
              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold shadow-md flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  {editingId ? 'Salvar Alterações' : 'Cadastrar Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <FileText size={20} className="text-slate-600" />
                Relatório de Estoque
              </h3>
              <button onClick={() => setIsReportOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-4 bg-slate-50 flex-1 overflow-hidden flex flex-col">
              <textarea 
                readOnly
                className="w-full h-full min-h-[300px] border border-slate-200 rounded-lg p-3 text-xs md:text-sm font-mono text-slate-700 bg-white resize-none focus:outline-none focus:border-blue-400"
                value={reportText}
              />
            </div>
            <div className="p-4 border-t border-slate-100 bg-white rounded-b-xl flex gap-3">
              <button 
                onClick={() => setIsReportOpen(false)}
                className="flex-1 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
              >
                Fechar
              </button>
              <button 
                onClick={copyToClipboard}
                className={`flex-1 py-2.5 rounded-lg font-medium text-white shadow-md flex items-center justify-center gap-2 transition-all ${copied ? 'bg-emerald-600' : 'bg-slate-800 hover:bg-slate-900'}`}
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
                {copied ? 'Copiado!' : 'Copiar Texto'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inventory List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="p-4 text-xs md:text-sm font-semibold">Item</th>
                <th className="p-4 text-xs md:text-sm font-semibold">Categoria</th>
                <th className="p-4 text-xs md:text-sm font-semibold text-center">Status</th>
                <th className="p-4 text-xs md:text-sm font-semibold text-right">Quantidade</th>
                <th className="p-4 text-xs md:text-sm font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Nenhum item encontrado.
                  </td>
                </tr>
              ) : (
                filteredInventory.map(item => {
                  const isLowStock = item.quantity <= item.minQuantity;
                  return (
                    <tr 
                      key={item.id} 
                      className={`transition-all group border-l-4 ${
                        isLowStock 
                          ? 'bg-red-50 hover:bg-red-100/80 border-red-500' 
                          : 'hover:bg-slate-50 border-transparent'
                      }`}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg transition-all ${
                              isLowStock 
                                ? 'bg-red-100 text-red-600 animate-pulse shadow-sm' 
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {isLowStock ? <AlertTriangle size={20} className="stroke-[2.5]" /> : <Package size={18} />}
                          </div>
                          <div>
                            <p className={`font-semibold text-sm md:text-base ${isLowStock ? 'text-red-900' : 'text-slate-800'}`}>
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-400 md:hidden">{item.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full border border-red-200 animate-pulse">
                            <ArrowDown size={12} className="stroke-[3]" /> Crítico
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-200">
                            <ArrowUp size={12} /> Normal
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-bold text-sm md:text-base ${isLowStock ? 'text-red-600' : 'text-slate-700'}`}>
                            {item.quantity} {item.unit}
                          </span>
                          <span className="text-xs text-slate-400">Min: {item.minQuantity}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                           <button 
                             onClick={() => handleEditClick(item)}
                             className={`p-2 rounded-lg transition-colors ${
                               isLowStock
                                 ? 'text-red-500 hover:bg-red-200'
                                 : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50'
                             }`}
                             title="Editar Estoque"
                           >
                             <Edit size={16} />
                           </button>
                           <button 
                             onClick={() => onDeleteItem(item.id)}
                             className={`p-2 rounded-lg transition-colors ${
                               isLowStock 
                                 ? 'text-red-400 hover:text-red-700 hover:bg-red-200' 
                                 : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                             }`}
                             title="Excluir Item"
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;