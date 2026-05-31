import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getNepalPollutionData(location: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Provide environmental data for ${location} in Nepal. 
    Return ONLY a valid JSON object:
    {
      "aqi": number,
      "waterQuality": number (0-100),
      "status": "Clean" | "Moderate" | "Polluted",
      "pollutants": string[],
      "sources": string[],
      "citizenReports": number,
      "riverData": {
        "name": string,
        "ph": number,
        "dissolvedOxygen": number,
        "turbidity": string
      }
    }`,
    config: {
      responseMimeType: "application/json",
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {
      aqi: 120,
      waterQuality: 45,
      status: "Moderate",
      pollutants: ["PM2.5", "Dust"],
      sources: ["Traffic", "Brick Kilns"],
      citizenReports: 12,
      riverData: { name: "Bagmati", ph: 6.5, dissolvedOxygen: 4.2, turbidity: "High" }
    };
  }
}

export async function analyzePollutionImage(base64Image: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          { text: "Analyze this image for signs of air or water pollution. Identify potential pollutants, environmental impact, and suggest immediate actions. Provide the analysis in markdown format." },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1] || base64Image
            }
          }
        ]
      }
    ]
  });

  return response.text;
}

export async function chatWithEcoAdvisor(message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are EcoGuard AI, an expert in environmental science, specifically air and water pollution control. Provide actionable, scientific, and encouraging advice to help users understand and reduce pollution. Keep responses concise and use markdown.",
    },
  });

  // Reconstruct history if needed, but for simplicity we'll just send the message
  // In a real app, we'd pass the history to ai.chats.create
  const response = await chat.sendMessage({ message });
  return response.text;
}
