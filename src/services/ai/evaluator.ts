import { ai, MODELS, generateContentWithRetry } from "./gemini";
import { Type } from "@google/genai";
import { AgentResponse } from "./agents";

export interface EvaluationResult {
  accuracy: number;
  clarity: number;
  completeness: number;
  efficiency: number;
  overall_score: number;
  feedback: string;
  final_synthesized_response: string;
}

export async function evaluateAndSynthesize(prompt: string, agentResponses: AgentResponse[]): Promise<EvaluationResult> {
  const responsesText = agentResponses.map(r => `[${r.agentName}]:\n${r.content}`).join("\n\n");
  
  const response = await generateContentWithRetry({
    model: MODELS.COMPLEX,
    contents: `Original Prompt: "${prompt}"\n\nAgent Responses:\n${responsesText}`,
    config: {
      systemInstruction: "You are the Critic Agent and Final Aggregator of Synaptixora. Evaluate the provided agent responses based on the original prompt. Score them out of 100 for accuracy, clarity, completeness, and efficiency. Then, synthesize the BEST parts of all responses into a single, perfect final response.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          accuracy: { type: Type.NUMBER, description: "Score 0-100" },
          clarity: { type: Type.NUMBER, description: "Score 0-100" },
          completeness: { type: Type.NUMBER, description: "Score 0-100" },
          efficiency: { type: Type.NUMBER, description: "Score 0-100" },
          overall_score: { type: Type.NUMBER, description: "Average score 0-100" },
          feedback: { type: Type.STRING, description: "Brief critique of the agents' performance" },
          final_synthesized_response: { type: Type.STRING, description: "The final, merged, and perfected response to the user's prompt. Use Markdown." }
        },
        required: ["accuracy", "clarity", "completeness", "efficiency", "overall_score", "feedback", "final_synthesized_response"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as EvaluationResult;
  } catch (e) {
    console.error("Failed to parse evaluation response", e);
    throw new Error("Evaluation failed");
  }
}
