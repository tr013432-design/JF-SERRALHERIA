import React, { useState, useMemo } from 'react';
import { QuoteItem, Quote, Client, Project } from '../types';
import { generateProfessionalProposal } from '../services/geminiService';
import { Plus, Trash2, Wand2, Loader2, Save, X, Maximize2, Check, History, Calendar, FileText, Download } from 'lucide-react';
import { jsPDF } from "jspdf";

interface QuoteBuilderProps {
  clients: Client[];
  projects: Project[];
  onSaveProject: (projectData: Partial<Project>) => void;
}

const QuoteBuilder: React.FC<QuoteBuilderProps> = ({ clients, projects, onSaveProject }) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [projectTitle, setProjectTitle] = useState('');
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [newItem, setNewItem] = useState({ description: '', quantity: 1, unitPrice: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProposal, setGeneratedProposal] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const handleAddItem = () => {
    if (!newItem.description || newItem.unitPrice <= 0) return;
    setItems([...items, { ...newItem, id: Math.random().toString(36).substr(2, 9) }]);
    setNewItem({ description: '', quantity: 1, unitPrice: 0 });
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const totalValue = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

  // Filter projects for the selected client to show in history
  const clientHistory = useMemo(() => {
    return projects.filter(p => p.clientId === selectedClientId).sort((a, b) => 
      new Date(b.lastUpdate).getTime() - new Date(a.lastUpdate).getTime()
    );
  }, [projects, selectedClientId]);

  const handleGenerateAI = async () => {
    if (!selectedClientId || !projectTitle || items.length === 0) {
      alert("Preencha o cliente, título e adicione itens antes de gerar a proposta.");
      return;
    }
    setIsGenerating(true);
    const client = clients.find(c => c.id === selectedClientId);
    if (client) {
      const proposal = await generateProfessionalProposal(client.name, projectTitle, items, totalValue);
      setGeneratedProposal(proposal);
      setIsModalOpen(true); // Open modal immediately after generation
    }
    setIsGenerating(false);
  };

  const handleSaveProjectInternal = () => {
    onSaveProject({
      title: projectTitle,
      clientId: selectedClientId,
      value: totalValue,
      description: generatedProposal
    });
    
    // Close modal first
    setIsModalOpen(false);

    // Show Success Animation
    setShowSuccess(true);

    // Reset Form
    setItems([]);
    setProjectTitle('');
    setSelectedClientId('');
    setGeneratedProposal('');
    setNewItem({ description: '', quantity: 1, unitPrice: 0 });

    // Hide Animation after delay
    setTimeout(() => {
      setShowSuccess(false);
    }, 2000);
  };

  const handleLoadHistoryItem = (project: Project) => {
    setGeneratedProposal(project.description || "Nenhuma proposta salva para este projeto.");
    setShowHistoryModal(false);
    setIsModalOpen(true);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const clientName = clients.find(c => c.id === selectedClientId)?.name || 'Cliente';
    const dateStr = new Date().toLocaleDateString('pt-BR');
    
    // Configurações de estilo
    const primaryColor = '#ea580c'; // Orange-600
    const textColor = '#334155'; // Slate-700
    
    // --- CABEÇALHO ---
    // Simulação do Logo (Texto estilizado)
    doc.setFontSize(22);
    doc.setTextColor(primaryColor);
    doc.setFont("helvetica", "bold");
    doc.text("JF Serralheria", 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.setFont("helvetica", "normal");
    doc.text("Gestão Inteligente & Serviços", 20, 26);

    // Título do Documento
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("PROPOSTA COMERCIAL", 20, 40);

    // --- INFO DO CLIENTE ---
    doc.setDrawColor(226, 232, 240); // Slate-200
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);

    doc.setFontSize(11);
    doc.setTextColor(textColor);
    doc.setFont("helvetica", "normal");
    
    doc.text(`Cliente:`, 20, 55);
    doc.setFont("helvetica", "bold");
    doc.text(clientName, 40, 55);
    
    doc.setFont("helvetica", "normal");
    doc.text(`Projeto:`, 20, 62);
    doc.setFont("helvetica", "bold");
    doc.text(projectTitle || 'Orçamento Personalizado', 40, 62);

    doc.setFont("helvetica", "normal");
    doc.text(`Data:`, 140, 55);
    doc.text(dateStr, 155, 55);
    
    doc.text(`Total:`, 140, 62);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(primaryColor);
    doc.text(`R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 155, 62);

    doc.setDrawColor(226, 232, 240);
    doc.line(20, 70, 190, 70);

    // --- CONTEÚDO DA PROPOSTA ---
    doc.setFontSize(11);
    doc.setTextColor(textColor);
    doc.setFont("helvetica", "normal");

    // Quebra o texto para caber na largura da página (largura A4 ~210mm, margens 20mm -> 170mm útil)
    const splitText = doc.splitTextToSize(generatedProposal, 170);
    
    let y = 80; // Posição inicial Y
    const pageHeight = 280; // Altura segura antes de quebrar página

    splitText.forEach((line: string) => {
      if (y > pageHeight) {
        doc.addPage();
        y = 20; // Reinicia Y na nova página
      }
      doc.text(line, 20, y);
      y += 6; // Espaçamento entre linhas
    });

    // --- RODAPÉ ---
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150);
        doc.text('Gerado por JF Serralheria CRM', 20, 290);
        doc.text(`Página ${i} de ${pageCount}`, 180, 290);
    }

    doc.save(`Proposta_${clientName.split(' ')[0]}_${dateStr.replace(/\//g, '-')}.pdf`);
  };

  return (
    <>
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 md:gap-6 h-auto lg:h-full">
        {/* Builder Form */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-auto lg:h-full lg:overflow-y-auto">
          <h2 className="text-lg md:text-xl font-bold text-slate-800 mb-4 md:mb-6 flex items-center gap-2">
            <span className="bg-orange-100 text-orange-600 p-1 md:p-1.5 rounded-lg">
               <Plus size={18} />
            </span>
            Novo Orçamento
          </h2>

          <div className="space-y-3 md:space-y-4 flex-grow">
            <div>
              <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Cliente</label>
              <div className="flex gap-2">
                <select 
                  className="w-full border border-slate-200 rounded-lg p-2 md:p-2.5 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button 
                  onClick={() => setShowHistoryModal(true)}
                  disabled={!selectedClientId || clientHistory.length === 0}
                  className="bg-slate-100 text-slate-600 px-3 rounded-lg border border-slate-200 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-colors"
                  title="Histórico de Propostas"
                >
                  <History size={18} />
                  <span className="text-xs font-bold hidden md:inline">{clientHistory.length}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-slate-700 mb-1">Título do Projeto</label>
              <input 
                type="text" 
                placeholder="Ex: Portão Basculante 3x2.5m"
                className="w-full border border-slate-200 rounded-lg p-2 md:p-2.5 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
              />
            </div>

            <div className="border-t border-slate-100 pt-3 md:pt-4 mt-3 md:mt-4">
              <h3 className="text-xs md:text-sm font-semibold text-slate-600 mb-2 md:mb-3">Adicionar Item</h3>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12 md:col-span-6">
                  <input 
                    type="text" 
                    placeholder="Descrição (ex: Ferro chato)"
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <input 
                    type="number" 
                    placeholder="Qtd"
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: Number(e.target.value)})}
                  />
                </div>
                <div className="col-span-5 md:col-span-3">
                  <input 
                    type="number" 
                    placeholder="R$ Un."
                    className="w-full border border-slate-200 rounded-lg p-2 text-sm"
                    value={newItem.unitPrice || ''}
                    onChange={(e) => setNewItem({...newItem, unitPrice: Number(e.target.value)})}
                  />
                </div>
                <div className="col-span-3 md:col-span-1">
                  <button 
                    onClick={handleAddItem}
                    className="w-full h-full bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors py-2 md:py-0"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Items List */}
            <div className="mt-3 md:mt-4 bg-slate-50 rounded-lg border border-slate-200 p-0 overflow-hidden">
              <table className="w-full text-xs md:text-sm text-left">
                <thead className="bg-slate-100 text-slate-600 font-medium border-b border-slate-200">
                  <tr>
                    <th className="p-2 md:p-3">Item</th>
                    <th className="p-2 md:p-3 text-center">Qtd</th>
                    <th className="p-2 md:p-3 text-right">Total</th>
                    <th className="p-2 md:p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr><td colSpan={4} className="p-4 text-center text-slate-400">Nenhum item adicionado</td></tr>
                  ) : (
                    items.map(item => (
                      <tr key={item.id} className="border-b border-slate-100 last:border-0">
                        <td className="p-2 md:p-3 truncate max-w-[100px] md:max-w-none">{item.description}</td>
                        <td className="p-2 md:p-3 text-center">{item.quantity}</td>
                        <td className="p-2 md:p-3 text-right whitespace-nowrap">R$ {(item.quantity * item.unitPrice).toFixed(2)}</td>
                        <td className="p-2 md:p-3 text-right">
                          <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="flex justify-between items-center pt-3 md:pt-4">
              <span className="text-sm md:text-lg font-bold text-slate-700">Total Estimado:</span>
              <span className="text-lg md:text-2xl font-bold text-blue-600">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-slate-100 flex gap-3">
            <button 
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-2.5 md:py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm md:text-base"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={18}/> : <Wand2 size={18} />}
              Gerar Proposta com IA
            </button>
          </div>
        </div>

        {/* AI Output / Preview Pane */}
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-[500px] lg:h-full">
           <div className="flex justify-between items-center mb-3 md:mb-4">
             <h2 className="text-base md:text-lg font-bold text-slate-800">Prévia da Proposta</h2>
             {generatedProposal && (
               <button 
                 onClick={() => setIsModalOpen(true)}
                 className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded-md transition-colors"
                 title="Expandir visualização"
               >
                 <Maximize2 size={18} />
               </button>
             )}
           </div>
           <div className="flex-grow bg-slate-50 border border-slate-200 rounded-lg p-3 md:p-4 font-mono text-xs md:text-sm text-slate-700 whitespace-pre-wrap overflow-y-auto">
             {generatedProposal ? generatedProposal : (
               <div className="h-full flex flex-col items-center justify-center text-slate-400">
                 <Wand2 size={40} className="mb-4 opacity-20" />
                 <p className="text-center text-xs md:text-sm">Preencha os dados e clique em <br/> "Gerar Proposta com IA".</p>
               </div>
             )}
           </div>
           {generatedProposal && (
             <div className="mt-3 md:mt-4 flex gap-3">
               <button 
                 onClick={handleSaveProjectInternal}
                 className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 md:py-3 rounded-lg font-medium flex items-center justify-center gap-2 text-sm md:text-base"
               >
                 <Save size={18} />
                 Salvar Projeto
               </button>
             </div>
           )}
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh]">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <History size={20} className="text-blue-500"/>
                  Histórico de Propostas
                </h3>
                <button 
                  onClick={() => setShowHistoryModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto bg-slate-50 flex-1 space-y-3">
                 <p className="text-xs text-slate-500 font-medium mb-2">Cliente: {clients.find(c => c.id === selectedClientId)?.name}</p>
                 {clientHistory.map(project => (
                   <div 
                    key={project.id}
                    onClick={() => handleLoadHistoryItem(project)}
                    className="bg-white p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all group"
                   >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-slate-700 text-sm">{project.title}</h4>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          R$ {project.value.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
                         <div className="flex items-center gap-1">
                           <Calendar size={12} />
                           {new Date(project.lastUpdate).toLocaleDateString('pt-BR')}
                         </div>
                         <div className="flex items-center gap-1 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                           <FileText size={12} />
                           Visualizar
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* Full Screen Proposal Modal */}
      {isModalOpen && generatedProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-slate-800">Proposta Gerada</h3>
                <p className="text-sm text-slate-500">Revise os detalhes antes de enviar para o cliente.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
              <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                <pre className="font-mono text-sm md:text-base text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {generatedProposal}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:p-6 border-t border-slate-100 flex flex-col md:flex-row gap-3 md:justify-end bg-white rounded-b-xl">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all"
              >
                Voltar
              </button>
              
              <button 
                onClick={handleDownloadPDF}
                className="px-6 py-2.5 rounded-lg font-medium bg-slate-800 hover:bg-slate-900 text-white shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Download size={18} />
                Baixar PDF
              </button>

              <button 
                onClick={handleSaveProjectInternal}
                className="px-6 py-2.5 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Check size={18} />
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Animation Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <Check size={40} className="text-emerald-600 stroke-[3]" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Sucesso!</h3>
            <p className="text-slate-500 font-medium">Projeto salvo com sucesso.</p>
          </div>
        </div>
      )}
    </>
  );
};

export default QuoteBuilder;