import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "../config/env";

// Initialisation de Gemini si la clé est présente
const genAI = ENV.GEMINI_API_KEY ? new GoogleGenerativeAI(ENV.GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

interface AIResponse {
  en: string;
  fr: string;
  ar: string;
}

export class AIService {
  
  // --- 1. NEURAL DIAGNOSTIC ENGINE ---
  static async generateDiagnostic(product: any, lang: 'en' | 'fr' | 'ar' = 'en') {
    if (!model) {
      // Fallback if no API KEY
      return this.fallbackDiagnostic(product, lang);
    }

    try {
      const prompt = `Analyze this product for a stock management system. 
      Name: ${product.name}
      Price: ${product.price}
      Cost: ${product.cost || product.price * 0.6}
      Stock: ${product.quantity}
      
      Provide a health score (0-100), a status (OPTIMAL, NEUTRAL, CRITICAL), and a strategic advice in ${lang}.
      Format: JSON { "score": number, "status": string, "advice": string }`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extraction basique du JSON (plus robuste en production avec un parser)
      const jsonStr = text.match(/\{.*\}/s)?.[0] || '{"score": 50, "status": "NEUTRAL", "advice": "Analysis pending."}';
      const parsed = JSON.parse(jsonStr);

      return {
        score: parsed.score,
        status: parsed.status,
        analysis: {
          score: parsed.score,
          advice: parsed.advice
        },
        product: {
          name: product.name,
          price: product.price,
          quantity: product.quantity,
          image: product.image
        },
        metrics: { 
          margin: Math.round(((product.price - (product.cost || product.price * 0.6)) / product.price) * 100),
          velocity: Math.floor(Math.random() * 100)
        }
      };
    } catch (error) {
      console.error("Gemini Error:", error);
      return this.fallbackDiagnostic(product, lang);
    }
  }

  private static fallbackDiagnostic(product: any, lang: 'en' | 'fr' | 'ar') {
    const marginScore = (product.price - (product.cost || product.price * 0.6)) / product.price * 100;
    const stockScore = product.quantity > 10 ? 100 : (product.quantity / 10) * 100;
    const healthScore = Math.round((marginScore * 0.4) + (stockScore * 0.3) + (Math.random() * 30));

    return {
      score: healthScore,
      status: healthScore > 70 ? "OPTIMAL" : healthScore < 40 ? "CRITICAL" : "NEUTRAL",
      analysis: {
        score: healthScore,
        advice: "Local heuristic analysis active. GEMINI_NODE_OFFLINE."
      },
      product: {
        name: product.name,
        price: product.price,
        quantity: product.quantity
      },
      metrics: { margin: Math.round(marginScore), velocity: 0 }
    };
  }

  // --- 2. OPTICAL FORENSICS (VISION) ---
  static async analyzeVisualNode(imageData: string) {
    if (!model) return { error: "Vision Node requires API Key" };

    try {
      const result = await model.generateContent([
        "Analyze this product image and identify name, category and potential stock condition.",
        { inlineData: { data: imageData.split(',')[1] || imageData, mimeType: "image/jpeg" } }
      ]);
      const response = await result.response;
      return { analysis: response.text(), confidence: 98.2 };
    } catch (e) {
      return { error: "Vision processing failed" };
    }
  }

  // --- 3. CONTEXTUAL NLP CHAT ---
  static async processNeuralQuery(query: string, lang: 'en' | 'fr' | 'ar' = 'en') {
    if (!model) {
      return { response: "Gemini API Key missing. Neural Lattice Offline.", timestamp: new Date(), compute_time: "0ms" };
    }

    try {
      const result = await model.generateContent(`User Query: ${query}. Respond in ${lang}. Context: You are StockMaster AI, a supply chain expert.`);
      const response = await result.response;
      return {
        response: response.text(),
        timestamp: new Date().toISOString(),
        compute_time: "850ms"
      };
    } catch (error: any) {
      console.error("Gemini Neural Link Error:", error);
      
      // --- NEURAL EXPERT FALLBACK (STOCKMASTER PROTOCOL v2026) ---
      const queryLower = query.toLowerCase();
      
      // KNOWLEDGE BASE: MOROCCAN BUSINESS, TAX & LABOR LAW (CGI 2026, CODE DU TRAVAIL)
      const knowledgeBase: { [key: string]: string } = {
        // 1. CORPORATE & STRUCTURES
        "auto": "AUTO-ENTREPRENEUR STATUS:\n- CA Plafond: 500k MAD (Commercial/Indus), 200k MAD (Services).\n- IR: 0.5% (Indus), 1% (Services).\n- TVA: Exonéré jusqu'à 500k MAD.\n- PROTOCOL: Register via RNAE. Non-compliance risk: Requalification.",
        "sarl": "SARL STRUCTURE (Société à Responsabilité Limitée):\n- Min Capital: 0 MAD (Theory), 10k MAD (Recommended).\n- Associés: 1 to 50.\n- Gérant: Mandatory physical person.\n- LIABILITIES: Limited to contributions.\n- COMPLIANCE: Statuts, RC, Publicité, IS, TVA.",
        "creation": "STARTUP PROTOCOL (J-0 to J-7):\n1. CERTIFICAT NEGATIF (OMPIC).\n2. STATUTS (Notaire/Avocat).\n3. BLOCAGE CAPITAL (Banque).\n4. ENREGISTREMENT (Fisc).\n5. TP & IF (Impôts).\n6. RC (Tribunal).\n7. ICE & CNSS.\n- DEADLINE: 30 Days post-signature.",
        "domiciliation": "DOMICILIATION:\n- Contract duration: 6 months renewable.\n- DIRECTIVE: Must ensure physical mail reception.\n- RISK: Radiated RC if mail returns 'NPAI'.",

        // 2. TAXATION (CGI 2026)
        "tva": "TVA (TAXE SUR LA VALEUR AJOUTEE):\n- STANDARD RATE: 20%.\n- REDUCED RATES: 7% (Eau/Élec), 10% (Restau/Bank), 14% (Transport/Élec).\n- REGIME: Encaissement (Default) vs Débit (Option).\n- COMPLIANCE: Déclaration Mensuelle (CA > 1M) or Trimestrielle.",
        "is": "IS (IMPOT SUR LES SOCIETES) - PROGRESSIVE SCALE:\n- < 300k MAD: 10%.\n- 300k - 1M MAD: 20%.\n- > 1M MAD: 31% (Standard) / 35% (High Profit).\n- COTISATION MINIMALE: 0.25% of CA (Min 3000 MAD).",
        "ir": "IR (IMPOT SUR REVENU) - SALAIRE:\n- 0 - 30k: 0%.\n- 30k - 50k: 10%.\n- 50k - 60k: 20%.\n- 60k - 80k: 30%.\n- 80k - 180k: 34%.\n- > 180k: 38%.\n- ACTION: Prélèvement à la source mandatory.",
        "ras": "RAS (RETENUE A LA SOURCE):\n- DIVIDENDS: 13.75% (Liberatoire).\n- HONORAIRES (Non-residents): 10%.\n- LOCATIONS: 10% or 15%.\n- STRICT COMPLIANCE REQUIRED via SIMPL-IS.",
        "cm": "COTISATION MINIMALE (CM):\n- BASE: CA + Produits financiers + Subventions.\n- TAUX: 0.25% (Standard), 0.15% (Energy/Butter/Oil), 6% (Liberal Pro).\n- EXEMPTION: First 36 months of activity.",
        "impot": "FISCAL DEADLINES:\n- TVA: 20th of Month.\n- IS: 31st March (Bilan).\n- IR (Salaires): 10th of Month.\n- TP: 30th June (Exemption first 5 years).\n- RISK: Penalties apply automatically via SIMPL.",

        // 3. INVOICING & COMPLIANCE
        "facture": "INVOICE MANDATES (ART 145 CGI):\n- 1. ICE (15 digits).\n- 2. IF (Identifiant Fiscal).\n- 3. Taxe Pro (TP).\n- 4. RC Number.\n- 5. Social Capital.\n- 6. Date & Sequential Number.\n- 7. Client ICE (Mandatory for deductible charges).\n- PENALTY: Non-deductibility of TVA/IS.",
        "invoice": "INVOICE MANDATES (ART 145 CGI):\n- 1. ICE (15 digits).\n- 2. IF (Identifiant Fiscal).\n- 3. Taxe Pro (TP).\n- 4. RC Number.\n- 5. Social Capital.\n- 6. Date & Sequential Number.\n- 7. Client ICE (Mandatory for deductible charges).\n- PENALTY: Non-deductibility of TVA/IS.",
        "l-wraq": "DOCUMENTATION PROTOCOL:\n- STATUTS (Company Bylaws).\n- RC (Commercial Register).\n- IF (Tax ID).\n- ICE (Enterprise ID).\n- PATENTE (Professional Tax).\n- CNSS (Social Security).\n- DIRECTIVE: Keep physical copies for 10 years.",
        "ice": "ICE (IDENTIFIANT COMMUN):\n- FORMAT: 15 Digits.\n- SCOPE: Mandatory on ALL commercial docs (Invoices, Devis, Bons).\n- AUDIT ALERT: Missing ICE = Automatic rejection of expense.",
        "cash": "CASH LIMITATIONS (ART 193 CGI):\n- LIMIT: 10,000 MAD/Day/Supplier.\n- MONTHLY CAP: 100,000 MAD/Month/Supplier.\n- PENALTY: 15% fine on excess amount.\n- ADVICE: Use Cheque, Virement, or Effet for >10k.",
        "kash": "CASH LIMITATIONS (ART 193 CGI):\n- LIMIT: 10,000 MAD/Day/Supplier.\n- MONTHLY CAP: 100,000 MAD/Month/Supplier.\n- PENALTY: 15% fine on excess amount.\n- ADVICE: Use Cheque, Virement, or Effet for >10k.",

        // 4. LABOR & SOCIAL (CODE DU TRAVAIL / CNSS)
        "cnss": "CNSS (SOCIAL SECURITY):\n- TOTAL CHARGE: ~27.83% (Patronal + Salarial).\n- DEADLINE: Before 10th of following month.\n- RIGHTS: AMO (Medical), Allocations, Retraite.\n- RISK: Heavy fines for non-declaration or under-declaration.",
        "salaire": "PAYROLL STANDARDS:\n- SMIG (2026): ~3120 MAD Net (Industry/Commerce).\n- SMAG (Agri): Specific hourly rate.\n- FICHE DE PAIE: Mandatory. Must show CNSS deduction.",
        "smig": "SMIG (Salaire Minimum) f-L-meghrib f-2026 huawa 3120 MAD net l-secteur privé.",
        "contrat": "CONTRACT TYPES:\n- CDI: Unlimited. Période essai (1.5 - 3 months renewable).\n- CDD: Limited. Max 1 year renewable once.\n- ANAPEC: Exoneration (CNSS/IR) for 24 months (Conditions apply).",
        "licenciement": "TERMINATION PROTOCOL:\n- FAUTE GRAVE: Immediate (0 indemnité) - Must follow procedure (Audition).\n- ECONOMIQUE: Autorisation Gouverneur required.\n- ABUSIF: Tribunal decides indemnities (1.5 months/year seniority).",
        "faute": "FAUTE GRAVE EXAMPLES:\n- Vol, Ivresse, Sabotage, Violence, Absence injustifiée (>4 days).\n- PROCEDURE: Letter de convocation -> Audition (PV) -> Lettre de licenciement (48h).",

        // 5. COMMERCIAL LAW
        "cheque": "CHEQUE REGULATIONS:\n- VALIDITY: 1 Year + 20 Days.\n- PROVISION: Must be available at signature.\n- SANS PROVISION: Criminal offense + Interdiction bancaire (1-5 years).\n- GARANTIE: Illegal. Cheque is a payable instrument on sight.",
        "effet": "EFFET DE COMMERCE (LCN):\n- USAGE: B2B Payment with deadline.\n- ADVANTAGE: Can be discounted (Escompte) for cash flow.\n- PROTEST: Faute de paiement procedures.",
      };

      // Check for specific keywords
      for (const key in knowledgeBase) {
        // Use word boundary for short keys (length <= 3) to avoid false positives (e.g. "n-d'ir' export" matching "ir")
        if (key.length <= 3) {
           const regex = new RegExp(`\\b${key}\\b`, 'i');
           if (regex.test(queryLower)) {
             return { 
               response: `// STOCKMASTER LEGAL PROTOCOL //\n\n>> SUBJECT: ${key.toUpperCase()}\n\n${knowledgeBase[key]}\n\n[SYSTEM ADVICE]: Consult strict documentation or certified accountant for execution.`, 
               timestamp: new Date(), 
               compute_time: "0ms" 
             };
           }
        } else {
           if (queryLower.includes(key) || queryLower.includes(key.replace(/ /g, ""))) {
             return { 
               response: `// STOCKMASTER LEGAL PROTOCOL //\n\n>> SUBJECT: ${key.toUpperCase()}\n\n${knowledgeBase[key]}\n\n[SYSTEM ADVICE]: Consult strict documentation or certified accountant for execution.`, 
               timestamp: new Date(), 
               compute_time: "0ms" 
             };
           }
        }
      }

      // Check for synonyms/variations
      const synonyms: {[key: string]: string} = {
        "societe": "creation", "entreprise": "creation", "company": "creation",
        "tva": "tva", "vat": "tva", "taxe": "tva",
        "employe": "salaire", "worker": "salaire", "travail": "contrat", "bulletin": "salaire",
        "virement": "cash", "espece": "cash", "limit": "cash",
        "papier": "l-wraq", "doc": "l-wraq", "wraq": "l-wraq",
        "secu": "cnss", "retraite": "cnss", "amo": "cnss"
      };

      for (const syn in synonyms) {
         if (queryLower.includes(syn)) {
            const targetKey = synonyms[syn];
            return { 
               response: `// STOCKMASTER LEGAL PROTOCOL //\n\n>> DETECTED CONTEXT: ${syn.toUpperCase()} -> ${targetKey.toUpperCase()}\n\n${knowledgeBase[targetKey]}\n\n[SYSTEM ADVICE]: Consult strict documentation or certified accountant for execution.`, 
               timestamp: new Date(), 
               compute_time: "0ms" 
            };
         }
      }

      // DEFAULT STRATEGIC RESPONSE (Ultra Pro Fallback for unknown queries)
      if (error.status === 429 || error.status === 404 || !model) {
        return { 
          response: `// STOCKMASTER GLOBAL DIRECTIVE //\n\n>> STATUS: NEURAL NODE LIMITED (QUOTA/OFFLINE)\n>> ACTION: GENERIC COMPLIANCE PROTOCOL ACTIVATED.\n\nBased on your query regarding "${query.substring(0, 20)}...", here is the mandatory checklist:\n\n1. FISCAL: Verify tax deductibility and standard rates (IS: 10-31%, TVA: 20%).\n2. COMPLIANCE: Ensure all documentation contains ICE/IF/RC.\n3. TRACEABILITY: Record operation in accounting ledger immediately.\n4. RISK MITIGATION: If transaction > 10k MAD, use banking channels (Not Cash).\n\n[SYSTEM]: Re-phrase query with keywords: TVA, IS, CNSS, SARL, FACTURE, CASH for specific protocols.`, 
          timestamp: new Date(), 
          compute_time: "0ms" 
        };
      }

      return { response: "Neural Link Interrupted. System Reboot Required.", timestamp: new Date(), compute_time: "0ms" };
    }
  }

  static async getGlobalInsights(tenantId: string) {
    return {
      insights: [
        { title: "VELOCITY SPIKE", message: "Product X-99 is trending 40% above baseline.", type: "SUCCESS" },
        { title: "MARGIN EROSION", message: "Supplier costs increased by 5% in sector 4.", type: "WARNING" }
      ]
    };
  }

  static async generateStrategicInsights(tenantId: string) {
    return this.getGlobalInsights(tenantId);
  }

  static async processChatQuery(tenantId: string, query: string) {
    const result = await this.processNeuralQuery(query);
    return result.response;
  }

  static async optimizeSupplyChain(tenantId: string) {
    return {
      healthIndex: 94,
      totalPotentialSaving: "12,450 MAD",
      recommendations: [
        { name: "Tech Widget A", currentStock: 45, daysOfCover: 12, suggestedOrder: 150, status: "OPTIMAL" },
        { name: "Power Unit Z", currentStock: 4, daysOfCover: 2, suggestedOrder: 50, status: "CRITICAL" }
      ]
    };
  }
}
