
import { GoogleGenAI } from "@google/genai";

export const generateProcurementDescription = async (title: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Act as a Senior Procurement Consultant for a Fortune 500 company. 
  Create a professional, highly structured procurement tender for: "${title}".
  
  Format the response with the following sections:
  1. EXECUTIVE SUMMARY: A high-level overview of the project objectives.
  2. SCOPE OF WORK: Specific technical and operational requirements.
  3. ELIGIBILITY CRITERIA: Minimum requirements for participating vendors.
  4. EVALUATION FRAMEWORK: How proposals will be weighted (e.g., Technical vs Financial).
  
  Use professional, concise, and formal business language. Avoid fluff. Output only the structured text.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    
    return response.text || "Technical draft unavailable.";
  } catch (error) {
    console.error("AI Generation Error:", error);
    return "Draft generation failed. Please enter technical requirements manually.";
  }
};
