import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("VITE_GEMINI_API_KEY is missing! Gemini features will not work.");
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || "" });

export async function identifyMovieFromDescription(description: string): Promise<{ movieName: string | null; confidence: number; explanation: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `Identify the movie based on this description, dialogue, or song: "${description}". 
      If you are very sure, provide the movie name. If you are not sure, provide your best guess.
      Return the result in JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            movieName: { type: Type.STRING, description: "The most likely movie name, or null if absolutely unknown." },
            confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 1." },
            explanation: { type: Type.STRING, description: "Briefly explain why you think it's this movie." }
          },
          required: ["movieName", "confidence", "explanation"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }

    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Gemini Identification Error:", error);
    if (error.response) {
      console.error("Gemini Error Response:", error.response);
    }
    return { movieName: null, confidence: 0, explanation: "I couldn't identify the movie right now. Check console for details." };
  }
}

export async function getChatResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  try {
    const chat = ai.chats.create({
      model: "gemini-flash-latest",
      config: {
        systemInstruction: `You are CineMood's helpful movie assistant. 
        Your goal is to help users find movies based on their mood or preferences.
        Keep your responses concise, friendly, and helpful.
        If a user asks for a recommendation, suggest 2-3 movies and explain why they fit the mood.
        Mention that they can use the "Magic Search" (Sparkles icon) in the search bar if they only remember a dialogue or a song.
        Use a neutral, professional yet warm tone.`,
      },
    });

    const result = await chat.sendMessage({ message });
    if (!result.text) {
      throw new Error("Empty response from Gemini Chat");
    }
    return result.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.response) {
      console.error("Gemini Chat Error Response:", error.response);
    }
    return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later!";
  }
}