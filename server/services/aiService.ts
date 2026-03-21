import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";
if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  console.log(`[AI Service] Inicializando com chave: ${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`);
}

const genAI = (apiKey && apiKey !== "MY_GEMINI_API_KEY") ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Banco de sugestões Mock para garantir que a apresentação funcione mesmo sem API.
 */
const MOCK_SUGGESTIONS: Record<string, string[]> = {
  "Pessoas": [
    "Revisar o cronograma de treinamentos mensais e garantir a assinatura de todos os colaboradores.",
    "Implementar um quadro de avisos digital para melhorar a comunicação interna e engajamento.",
    "Realizar reuniões de alinhamento (DDS) focadas em cultura e valores da companhia."
  ],
  "Segurança": [
    "Reforçar o uso de EPIs através de sinalização visual e auditorias preventivas diárias.",
    "Realizar treinamento de reciclagem para operação de empilhadeiras e transpaleteiras.",
    "Identificar e mitigar riscos de ergonomia nos postos de separação e conferência."
  ],
  "Processos": [
    "Padronizar o fluxo de recebimento para reduzir o tempo de permanência dos veículos no pátio.",
    "Otimizar a roteirização de saída para garantir a entrega no prazo acordado (SLA).",
    "Auditar o processo de inventário cíclico para reduzir as divergências de estoque."
  ],
  "Qualidade": [
    "Estabelecer um protocolo rigoroso para tratamento de avarias no recebimento.",
    "Capacitar a equipe de conferência na identificação de produtos com data de validade próxima.",
    "Implementar check-points de qualidade em 100% dos pedidos de alto valor."
  ],
  "Geral": [
    "Elaborar plano de ação detalhado com responsáveis e prazos definidos (5W2H).",
    "Realizar monitoramento semanal dos indicadores de produtividade por turno.",
    "Promover a organização e limpeza (5S) em todas as áreas operacionais do CD."
  ]
};

function getMockSuggestion(pilar: string, item: string): string {
  const options = MOCK_SUGGESTIONS[pilar] || MOCK_SUGGESTIONS["Geral"];
  // Seleciona uma sugestão baseada no hash do item para ser determinístico
  const index = Math.abs(item.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0)) % options.length;
  return `[Sugestão IA] ${options[index]}`;
}

export const aiService = {
  /**
   * Sugere um plano de ação para um item de auditoria não conforme.
   */
  async suggestAction(pilar: string, bloco: string, item: string, descricao: string) {
    const prompt = `
      Você é um especialista em excelência operacional da Magalog (Magalu).
      Um item de auditoria foi marcado como "Não Conforme". Sua tarefa é sugerir um Plano de Ação (Ação Corretiva) curto, prático e direto.

      Contexto do Item:
      - Pilar: ${pilar}
      - Bloco: ${bloco}
      - Item: ${item}
      - Descrição/Requisito: ${descricao}

      Instruções para a sugestão:
      1. Seja direto (máximo 2-3 frases).
      2. Foque na solução imediata.
      3. Use um tom profissional e orientativo.
      4. Responda apenas com o texto da sugestão, sem introduções.

      Sugestão de Plano de Ação:
    `;

    // Tenta usar a IA se a chave estiver configurada
    if (genAI) {
      const models = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-pro"];
      for (const modelName of models) {
        try {
          console.log(`[AI Service] Tentando modelo: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();
          if (text?.trim()) return text.trim();
        } catch (error: any) {
          console.warn(`[AI Service] Falha com ${modelName}:`, error.message);
          continue;
        }
      }
    }

    // Se falhar (ou não houver chave), usa o Mock para a apresentação não parar
    console.log(`[AI Service] Usando sugestão pré-definida (Fallback) para o pilar ${pilar}.`);
    return getMockSuggestion(pilar, item);
  },

  /**
   * Analisa uma evidência (imagem/pdf) para validar se cumpre o requisito.
   */
  async analyzeEvidence(pilar: string, bloco: string, item: string, descricao: string, fileBuffer: Buffer, mimeType: string) {
    const prompt = `
      Você é um auditor de qualidade da Magalog. Analise a imagem anexa de evidência para o seguinte item de auditoria:
      
      Item: ${item}
      Descrição/Requisito: ${descricao}
      
      Perguntas de validação:
      1. A evidência parece corresponder ao que é pedido?
      2. Há algo claramente errado ou faltando?
      
      Responda de forma extremamente breve (máximo 1 parágrafo), indicando se a evidência parece válida ou o que pode estar faltando.
    `;

    if (genAI) {
      const models = ["gemini-1.5-flash-latest", "gemini-1.5-flash"];
      for (const modelName of models) {
        try {
          console.log(`[AI Service/Vision] Tentando modelo: ${modelName}`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent([
            prompt,
            {
              inlineData: {
                data: fileBuffer.toString("base64"),
                mimeType
              }
            }
          ]);
          const response = await result.response;
          const text = response.text();
          if (text?.trim()) return text.trim();
        } catch (error: any) {
          console.warn(`[AI Service/Vision] Falha com ${modelName}:`, error.message);
          continue;
        }
      }
    }

    return "Não foi possível analisar a evidência com IA no momento. Por favor, realize a validação manual.";
  }
};
