import { ai, MODELS, generateContentWithRetry } from "./gemini";
import { Attachment } from "@/store/useStore";

export interface AgentResponse {
  agentName: string;
  content: string;
}

export async function executeAgent(agentName: string, prompt: string, attachments: Attachment[] = [], context?: string): Promise<AgentResponse> {
  const systemInstruction = `You are the ${agentName} within Synaptixora, an Autonomous Multi-Agent Intelligence Workspace. 
  Provide your expert response to the user's prompt. Be concise, accurate, and professional.
  ${context ? `Additional Context: ${context}` : ''}`;

  const parts: any[] = [];
  if (attachments.length > 0) {
    for (const att of attachments) {
      if (att.type.startsWith("image/")) {
        parts.push({
          inlineData: {
            data: att.data.split(",")[1] || att.data,
            mimeType: att.type,
          }
        });
      } else {
        parts.push({ text: `[Attached File: ${att.name}]` });
      }
    }
  }
  parts.push({ text: prompt });

  const response = await generateContentWithRetry({
    model: MODELS.COMPLEX,
    contents: { parts },
    config: {
      systemInstruction,
      temperature: 0.7,
    }
  });

  return {
    agentName,
    content: response.text || "No response generated.",
  };
}

export async function executeSwarm(agents: string[], prompt: string, attachments: Attachment[] = []): Promise<AgentResponse[]> {
  // Execute all selected agents in parallel, but with a slight stagger to avoid bursting rate limits
  const promises = agents.map(async (agent, index) => {
    if (index > 0) {
      await new Promise(resolve => setTimeout(resolve, index * 1500));
    }
    return executeAgent(agent, prompt, attachments);
  });
  return Promise.all(promises);
}
