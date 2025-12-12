import { GoogleGenAI, Type } from "@google/genai";
import { Message } from "../types";

let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
};

const SYSTEM_INSTRUCTION = `You are a Digital Escape Planner and Security Assistant.
1. Your answers must be concise, practical, and calm.
2. Prioritize immediate physical safety.
3. For digital threats, emphasize evidence preservation (hashing, screenshots, metadata).
4. Do not be conversational; be instructional unless greeted.
5. Use Markdown formatting (bolding, lists) to make advice scannable.
`;

export const sendMessageToGemini = async (
  currentMessage: string,
  history: Message[]
): Promise<string> => {
  try {
    const client = getClient();
    
    const chat = client.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
      history: history.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      }))
    });

    const result = await chat.sendMessage({
        message: currentMessage
    });

    return result.text || "I'm having trouble responding right now.";

  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Connection error. Please check your internet or API configuration.";
  }
};

export const scanLocationSafety = async (location: string): Promise<{ level: 'LOW'|'MEDIUM'|'HIGH', message: string }> => {
  try {
    const client = getClient();
    
    // Using a fresh generateContent call for structured data extraction
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the current general safety situation or potential risks for the location: "${location}". 
      Categorize the threat level as LOW, MEDIUM, or HIGH based on general knowledge of safety, crime, or recent events if known. 
      Provide a very brief (1 sentence) status message.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            level: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] },
            message: { type: Type.STRING }
          },
          required: ["level", "message"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Empty response");

  } catch (error) {
    console.error("Safety Scan Error:", error);
    return { level: 'LOW', message: "Unable to verify location status at this time." };
  }
};
