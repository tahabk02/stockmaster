import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "../config/env";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY || "");

export class AIService {
  /**
   * Diagnostic de Produit (Analyse de Performance)
   */
  static async generateDiagnostic(product: any, lang: string = 'fr') {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Analyse ce produit de l'inventaire :
      Nom: ${product.name}
      Stock Actuel: ${product.quantity}
      Prix: ${product.price}
      Catégorie: ${product.category?.name || 'N/A'}
      
      Instructions:
      1. Évalue si le stock est optimal par rapport au prix.
      2. Donne une recommandation stratégique (ex: augmenter le prix, réapprovisionner, promotion).
      3. Réponds en ${lang === 'ar' ? 'Arabe' : lang === 'fr' ? 'Français' : 'Anglais'}.
      Format de réponse: JSON court avec { status: "OPTIMAL|CRITICAL|WARNING", advice: "string", riskLevel: 0-100 }.
    `;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text().replace(/```json|```/g, ""));
    } catch (error: any) {
      console.error("AI Diagnostic Error:", error.message);
      return { status: "UNKNOWN", advice: "Analyse neurale indisponible.", riskLevel: 50 };
    }
  }

  /**
   * Neural Chat (Context Aware)
   */
  static async processNeuralQuery(query: string, contextData: any, lang: string = 'fr') {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Tu es l'IA de gestion StockMaster Pro. 
      Données actuelles du système : ${JSON.stringify(contextData)}
      Question de l'utilisateur : "${query}"
      
      Réponds de manière technique, précise et concise en ${lang}. 
      Utilise un ton professionnel et autoritaire.
    `;

    try {
      const result = await model.generateContent(prompt);
      return { response: result.response.text(), timestamp: new Date() };
    } catch (error: any) {
      console.error("Neural Chat Error:", error.message);
      throw error;
    }
  }

  /**
   * Prévision de Rupture (Analyse de Flux)
   */
  static async getGlobalInsights(tenantData: any) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyse ces données SaaS : ${JSON.stringify(tenantData)}. Donne 3 insights clés sur la rentabilité et les risques de stock.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  /**
   * Dynamic Strategic Analysis (Compatibility Layer)
   */
  static async generateStrategicInsights(tenantId: string) {
    try {
      const insightsStr = await this.getGlobalInsights({ tenantId });
      // Split the text into separate insights
      const insights = insightsStr
        .split(/[.\n]/)
        .filter(i => i.trim().length > 10)
        .map(i => i.trim());
      
      return { insights, timestamp: new Date() };
    } catch (error) {
      return { insights: ["Analyse stratégique temporairement indisponible."], timestamp: new Date() };
    }
  }

  /**
   * Neural Chat Bridge (Compatibility Layer)
   */
  static async processChatQuery(tenantId: string, query: string) {
    return await this.processNeuralQuery(query, { tenantId, mode: "STRATEGIC" }, "fr");
  }

  /**
   * Neural Legal Advisor Bridge (Compatibility Layer)
   */
  static async processLegalQuery(query: string, lang: string = "fr") {
    return await this.processNeuralQuery(query, { mode: "LEGAL_ADVISOR" }, lang);
  }
}
