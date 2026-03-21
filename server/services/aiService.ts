import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";
console.log(`[AI Service] Inicializando com chave: ${apiKey.substring(0, 6)}...${apiKey.substring(apiKey.length - 4)}`);

const genAI = new GoogleGenerativeAI(apiKey);

export const aiService = {
  /**
   * Sugere um plano de ação para um item de auditoria não conforme.
   */
  async suggestAction(pilar: string, bloco: string, item: string, descricao: string) {
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY não configurada corretamente no servidor.");
    }

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

    const models = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-pro"];
    let lastError: any;

    for (const modelName of models) {
      try {
        console.log(`[AI Service] Tentando modelo: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text?.trim() || "Não foi possível gerar uma sugestão automática no momento.";
      } catch (error: any) {
        lastError = error;
        console.warn(`[AI Service] Falha com ${modelName}:`, error.message);
        continue;
      }
    }

    console.error("Erro ao gerar sugestão com Gemini após tentar todos os modelos:", lastError);
    throw new Error(lastError?.message || "Falha ao gerar sugestão de IA após tentar múltiplos modelos.");
  },

  /**
   * Analisa uma evidência (imagem/pdf) para validar se cumpre o requisito.
   */
  async analyzeEvidence(pilar: string, bloco: string, item: string, descricao: string, fileBuffer: Buffer, mimeType: string) {
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("GEMINI_API_KEY não configurada no servidor.");
    }

    const prompt = `
      Você é um auditor de qualidade da Magalog. Analise a imagem anexa de evidência para o seguinte item de auditoria:
      
      Item: ${item}
      Descrição/Requisito: ${descricao}
      
      Perguntas de validação:
      1. A evidência parece corresponder ao que é pedido?
      2. Há algo claramente errado ou faltando?
      
      Responda de forma extremamente breve (máximo 1 parágrafo), indicando se a evidência parece válida ou o que pode estar faltando.
    `;

    const models = ["gemini-1.5-flash-latest", "gemini-1.5-flash"];
    let lastError: any;

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
        return text?.trim() || "Não foi possível analisar a evidência com IA.";
      } catch (error: any) {
        lastError = error;
        console.warn(`[AI Service/Vision] Falha com ${modelName}:`, error.message);
        continue;
      }
    }

    console.error("Erro ao analisar evidência com Gemini:", lastError);
    throw new Error(lastError?.message || "Falha ao analisar evidência com IA.");
  }
};
