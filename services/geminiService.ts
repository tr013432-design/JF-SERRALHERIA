import { GoogleGenAI } from "@google/genai";
import { Project, QuoteItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProfessionalProposal = async (
  clientName: string,
  projectTitle: string,
  items: QuoteItem[],
  totalValue: number
): Promise<string> => {
  try {
    const itemsList = items.map(i => `- ${i.quantity}x ${i.description} (R$ ${i.unitPrice.toFixed(2)})`).join('\n');
    
    const prompt = `
      Você é um assistente de vendas da "JF Serralheria".
      Escreva uma mensagem formal e persuasiva para enviar pelo WhatsApp ou Email para o cliente.
      
      Dados do Cliente: ${clientName}
      Projeto: ${projectTitle}
      
      Itens:
      ${itemsList}
      
      Valor Total: R$ ${totalValue.toFixed(2)}
      
      A mensagem deve:
      1. Cumprimentar o cliente.
      2. Descrever brevemente a qualidade do serviço (metais de alta resistência, acabamento fino).
      3. Listar o valor total.
      4. Mencionar que aceitamos cartão e pix.
      5. Ter um tom profissional mas acessível.
      6. Ser formatada em Markdown simples.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: "Você é um especialista em vendas de serralheria.",
        temperature: 0.7,
      }
    });

    return response.text || "Não foi possível gerar a proposta no momento.";
  } catch (error) {
    console.error("Erro ao gerar proposta com IA:", error);
    return "Erro ao conectar com o assistente inteligente.";
  }
};

export const analyzeProjectFeasibility = async (description: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analise o seguinte pedido de serralheria e liste 3 possíveis desafios técnicos e 3 materiais recomendados:\n\n"${description}"`,
    });
    return response.text || "";
  } catch (error) {
    console.error(error);
    return "";
  }
}
