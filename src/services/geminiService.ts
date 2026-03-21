import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function identifyMovieFromDescription(description: string): Promise<{ movieName: string | null; confidence: number; explanation: string }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Identification Error:", error);
    return { movieName: null, confidence: 0, explanation: "I couldn't identify the movie right now." };
  }
}

export async function getChatResponse(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are CineMood's helpful movie assistant. 
        Your goal is to help users find movies based on their mood or preferences.
        Keep your responses concise, friendly, and helpful.
        If a user asks for a recommendation, suggest 2-3 movies and explain why they fit the mood.
        Mention that they can use the "Magic Search" (Sparkles icon) in the search bar if they only remember a dialogue or a song.
        Use a neutral, professional yet warm tone.`,
      },
    });

    // We don't use the history directly in sendMessage for simplicity in this helper, 
    // but we could pass it if we wanted a full conversation.
    // For now, let's just send the message.
    const result = await chat.sendMessage({ message });
    return result.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again later!";
  }
}
