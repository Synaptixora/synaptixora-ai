import { ai, MODELS, generateContentWithRetry } from "./gemini";
import { Type } from "@google/genai";

export interface RouteResult {
  task_type: string;
  agents_selected: string[];
  confidence_score: number;
  complexity_level: "low" | "medium" | "high";
  intent: string;
  domain: string;
  required_skills: string[];
}

export const AVAILABLE_AGENTS = [
  "Coding Agent", "Research Agent", "Writing Agent", "Explanation Agent",
  "Idea Generation Agent", "Debugging Agent", "Data Analyst Agent",
  "Math Solver Agent", "Logic & Reasoning Agent", "Planning Agent",
  "Critic Agent", "Fact-Checker Agent", "Summarization Agent",
  "Translation Agent", "UI/UX Designer Agent", "System Architect Agent",
  "Interview Prep Agent", "Story Generator Agent", "Script Writer Agent",
  "Marketing Copy Agent", "Branding Agent", "Meme Generator Agent"
];

export async function routeTask(prompt: string): Promise<RouteResult> {
  const response = await generateContentWithRetry({
    model: MODELS.FAST,
    contents: `Analyze the following user prompt and determine the best AI agents to handle it.
    
    Available Agents: ${AVAILABLE_AGENTS.join(", ")}
    
    User Prompt: "${prompt}"`,
    config: {
      systemInstruction: "You are the Cognitive Router of Synaptixora, an advanced AI OS. Your job is to analyze prompts, determine intent, complexity, and select the best agents to collaborate on the task.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          task_type: { type: Type.STRING, description: "A short description of the task type (e.g., 'Code Generation', 'Creative Writing')" },
          agents_selected: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of 1 to 3 agents best suited for this task from the available list."
          },
          confidence_score: { type: Type.NUMBER, description: "Confidence score between 0.0 and 1.0" },
          complexity_level: { type: Type.STRING, description: "Must be 'low', 'medium', or 'high'" },
          intent: { type: Type.STRING, description: "The core intent of the user" },
          domain: { type: Type.STRING, description: "The domain of knowledge (e.g., 'Software Engineering', 'Mathematics')" },
          required_skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Specific skills required (e.g., 'React', 'Data Analysis')"
          }
        },
        required: ["task_type", "agents_selected", "confidence_score", "complexity_level", "intent", "domain", "required_skills"]
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}") as RouteResult;
  } catch (e) {
    console.error("Failed to parse router response", e);
    throw new Error("Routing failed");
  }
}
