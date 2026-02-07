import { GoogleGenAI } from "@google/genai";

export type SummaryType = "executive" | "detailed" | "bullet";

export class GeminiService {
  private getApiKey(): string {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("API Key não configurada no arquivo .env");
    return apiKey;
  }

  async extractTableFromImage(imageBase64: string, mimeType: string): Promise<string> {
    try {
      const apiKey = this.getApiKey();
      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: imageBase64,
                },
              },
              { text: "Extract any table found in this image and format it as a clean Markdown table. If no table is found, say 'Nenhuma tabela encontrada'. Return only the markdown." }
            ],
          }
        ],
      });

      return response.text || "Erro ao processar imagem.";
    } catch (error) {
      console.error("Gemini Error:", error);
      throw new Error("Falha na comunicação com a IA.");
    }
  }

  async summarizePDF(text: string, type: SummaryType = "executive"): Promise<string> {
    try {
      const apiKey = this.getApiKey();
      const ai = new GoogleGenAI({ apiKey });

      let prompt = "";
      switch (type) {
        case "executive":
          prompt = "Gere um resumo executivo conciso e profissional do seguinte documento, destacando os pontos mais importantes. Use formatação Markdown (negrito, listas) para clareza.";
          break;
        case "detailed":
          prompt = "Gere um resumo detalhado do seguinte documento, incluindo todos os pontos relevantes organizados por seções. Use formatação Markdown.";
          break;
        case "bullet":
          prompt = "Extraia e liste os pontos-chave mais importantes do seguinte documento em formato de tópicos (bullet points). Use formatação Markdown.";
          break;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: `${prompt}\n\nTexto do documento:\n${text}` }] }]
      });

      return response.text || "Falha ao gerar resumo.";
    } catch (error) {
      console.error("Gemini Summarize Error:", error);
      throw new Error("Falha ao gerar resumo com a IA.");
    }
  }

  async extractDataFromText(text: string, requestedTypes: string[]): Promise<any> {
    try {
      const apiKey = this.getApiKey();
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Extraia os seguintes tipos de dados do texto abaixo e retorne em formato JSON estruturado: ${requestedTypes.join(', ')}. 
Para cada tipo encontrado, retorne uma lista com os dados extraídos. Use as chaves exatamente como solicitado.
Texto para análise:
${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        }
      });

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini Extraction Error:", error);
      throw new Error("Falha ao extrair dados com a IA.");
    }
  }

  async translatePDFText(text: string, targetLanguage: string): Promise<string> {
    try {
      const apiKey = this.getApiKey();
      const ai = new GoogleGenAI({ apiKey });

      const languageNames: Record<string, string> = {
        pt: 'Português',
        en: 'Inglês',
        es: 'Espanhol',
        ar: 'Árabe',
        he: 'Hebraico'
      };

      const targetLangName = languageNames[targetLanguage] || targetLanguage;

      const prompt = `Traduza o texto a seguir para ${targetLangName} mantendo o sentido, a pontuação e a estrutura de parágrafos. Responda APENAS com o texto traduzido, sem explicações.\n\nTexto:\n${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      return response.text || "Falha na tradução.";
    } catch (error) {
      console.error("Gemini Translation Error:", error);
      throw new Error("Falha ao traduzir documento com a IA.");
    }
  }

  async classifyDocument(text: string): Promise<any> {
    try {
      const apiKey = this.getApiKey();
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Analise o seguinte documento e forneça uma classificação detalhada em formato JSON estruturado. 
Classifique o documento nas seguintes categorias principais:
1. Tipo de Documento (contrato, relatório, invoice, formulário, etc.)
2. Área/Setor (jurídico, financeiro, médico, educacional, etc.)
3. Nível de Formalidade (formal, informal, técnico)
4. Público-alvo (interno, externo, geral, específico)

Para cada categoria, forneça uma pontuação de confiança de 0 a 100.
Também identifique tags relevantes e forneça uma análise detalhada.

Formato JSON esperado:
{
  "categories": [
    {
      "type": "primary_category",
      "name": "Nome da Categoria",
      "description": "Descrição breve",
      "confidence": 95,
      "icon": "lucide-icon-name (ex: FileText, Gavel, BadgeDollarSign, HeartPulse, GraduationCap)"
    }
  ],
  "tags": ["tag1", "tag2"],
  "analysis": "Análise detalhada do conteúdo..."
}

Texto:
${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
        }
      });

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini Classification Error:", error);
      throw new Error("Falha ao classificar documento com a IA.");
    }
  }

  async generateContract(details: {
    type: string,
    jurisdiction: string,
    party1: string,
    party1Doc: string,
    party2: string,
    party2Doc: string,
    object: string,
    value: string,
    duration: string,
    specialClauses?: string
  }, lang: string): Promise<string> {
    try {
      const apiKey = this.getApiKey();
      const ai = new GoogleGenAI({ apiKey });

      const languageNames: Record<string, string> = {
        pt: 'Português',
        en: 'Inglês',
        es: 'Espanhol',
        ar: 'Árabe',
        he: 'Hebraico'
      };

      const typeLabels: Record<string, string> = {
        service: 'Prestação de Serviços',
        employment: 'Contrato de Trabalho',
        rent: 'Locação/Arrendamento',
        sale: 'Compra e Venda',
        partnership: 'Sociedade/Parceria',
        nda: 'Confidencialidade (NDA)'
      };

      const langName = languageNames[lang] || 'Português';
      const typeLabel = typeLabels[details.type] || details.type;

      const prompt = `Gere um contrato profissional e juridicamente válido no idioma ${langName} para a jurisdição do país: ${details.jurisdiction}.
Tipo de Contrato: ${typeLabel}.

PARTES CONTRATANTES:
1. ${details.party1} (Documento: ${details.party1Doc})
2. ${details.party2} (Documento: ${details.party2Doc})

DETALHES DO ACORDO:
- Objeto do Contrato: ${details.object}
- Valor: ${details.value}
- Prazo/Duração: ${details.duration}
- Cláusulas Especiais/Observações: ${details.specialClauses || 'Nenhuma'}

INSTRUÇÕES:
- Use linguagem jurídica formal adequada ao país selecionado (${details.jurisdiction}).
- O contrato deve ser completo, com seções de obrigações, rescisão, foro e assinaturas.
- Formate com clareza usando Markdown para títulos e seções.
- Data atual: ${new Date().toLocaleDateString(details.jurisdiction === 'US' ? 'en-US' : 'pt-BR')}.

Responda APENAS com o texto do contrato.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });

      return response.text || "Falha ao gerar contrato.";
    } catch (error) {
      console.error("Gemini Contract Generation Error:", error);
      throw new Error("Falha ao gerar contrato com a IA.");
    }
  }
}

export const geminiService = new GeminiService();
