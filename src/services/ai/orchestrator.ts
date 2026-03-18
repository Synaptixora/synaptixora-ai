import { routeTask, RouteResult } from "./router";
import { executeSwarm, AgentResponse } from "./agents";
import { evaluateAndSynthesize, EvaluationResult } from "./evaluator";
import { Attachment } from "@/store/useStore";

export interface OrchestrationState {
  status: "idle" | "routing" | "executing" | "evaluating" | "complete" | "error";
  prompt: string;
  route?: RouteResult;
  agentResponses?: AgentResponse[];
  evaluation?: EvaluationResult;
  error?: string;
}

export type OrchestrationCallback = (state: Partial<OrchestrationState>) => void;

export async function orchestrateTask(prompt: string, attachments: Attachment[] = [], onProgress: OrchestrationCallback) {
  try {
    // 1. Routing
    onProgress({ status: "routing", prompt });
    const route = await routeTask(prompt);
    onProgress({ route });

    // 2. Execution (Swarm)
    onProgress({ status: "executing" });
    const agentsToRun = route.agents_selected.length > 0 ? route.agents_selected : ["Logic & Reasoning Agent"];
    const agentResponses = await executeSwarm(agentsToRun, prompt, attachments);
    onProgress({ agentResponses });

    // 3. Evaluation & Synthesis
    onProgress({ status: "evaluating" });
    const evaluation = await evaluateAndSynthesize(prompt, agentResponses);
    onProgress({ status: "complete", evaluation });

    return { route, agentResponses, evaluation };
  } catch (error: any) {
    onProgress({ status: "error", error: error.message || "An unknown error occurred" });
    throw error;
  }
}
