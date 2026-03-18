import { GoogleGenAI, GenerateContentParameters, GenerateContentResponse } from "@google/genai";

// Initialize the Gemini API client
// The API key is injected by Vite during build/dev from process.env.GEMINI_API_KEY
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const MODELS = {
  FAST: "gemini-3-flash-preview",
  // Using flash-preview for COMPLEX as well to avoid the strict 2 RPM limit on pro-preview
  COMPLEX: "gemini-3-flash-preview",
  IMAGE: "gemini-2.5-flash-image",
  VIDEO: "veo-3.1-fast-generate-preview",
};

export async function generateContentWithRetry(
  params: GenerateContentParameters,
  maxRetries = 5,
  baseDelay = 2000
): Promise<GenerateContentResponse> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await ai.models.generateContent(params);
    } catch (error: any) {
      const isRateLimit = 
        error?.status === "RESOURCE_EXHAUSTED" || 
        error?.status === 429 || 
        error?.message?.includes("429") ||
        error?.message?.includes("Quota exceeded") ||
        error?.message?.includes("rate limit");

      if (isRateLimit) {
        attempt++;
        if (attempt >= maxRetries) {
          throw new Error(`API Quota Exceeded. Please try again later or check your API key billing details. Original error: ${error.message}`);
        }
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.warn(`Rate limit hit. Retrying in ${Math.round(delay)}ms... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Failed to generate content after retries");
}
