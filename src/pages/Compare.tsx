import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GitCompare, Bot, Zap, ShieldCheck, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { AVAILABLE_AGENTS, routeTask } from "@/services/ai/router";
import { executeSwarm, AgentResponse } from "@/services/ai/agents";
import { evaluateAndSynthesize, EvaluationResult } from "@/services/ai/evaluator";
import ReactMarkdown from "react-markdown";

export default function Compare() {
  const [topic, setTopic] = useState("");
  const [selectedAgents, setSelectedAgents] = useState<string[]>(["Coding Agent", "System Architect Agent"]);
  const [status, setStatus] = useState<"idle" | "running" | "done" | "synthesizing" | "synthesized" | "suggesting">("idle");
  const [results, setResults] = useState<AgentResponse[]>([]);
  const [synthesis, setSynthesis] = useState<EvaluationResult | null>(null);

  const toggleAgent = (agent: string) => {
    setSelectedAgents(prev => 
      prev.includes(agent) 
        ? prev.filter(a => a !== agent)
        : [...prev, agent] // Removed limit of 4
    );
  };

  const suggestAgents = async () => {
    if (!topic.trim()) return;
    setStatus("suggesting");
    try {
      const route = await routeTask(topic);
      setSelectedAgents(route.agents_selected);
    } catch (error) {
      console.error("Suggestion failed", error);
    } finally {
      setStatus("idle");
    }
  };

  const runComparison = async () => {
    if (!topic.trim() || selectedAgents.length < 2) return;
    setStatus("running");
    setResults([]);
    setSynthesis(null);

    try {
      const responses = await executeSwarm(selectedAgents, topic);
      setResults(responses);
      setStatus("done");
    } catch (error) {
      console.error("Comparison failed", error);
      setStatus("idle");
    }
  };

  const runSynthesis = async () => {
    if (results.length < 2) return;
    setStatus("synthesizing");
    try {
      const evaluation = await evaluateAndSynthesize(topic, results);
      setSynthesis(evaluation);
      setStatus("synthesized");
    } catch (error) {
      console.error("Synthesis failed", error);
      setStatus("done");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-8">
      <header className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <GitCompare className="w-8 h-8 text-fuchsia-500" />
            Agent Comparison
          </h1>
          <p className="text-white/60 mt-2">Compare different AI agents side-by-side on the same topic to produce the most accurate output.</p>
        </div>
      </header>

      <div className="space-y-6">
        <Card className="bg-black/40 border-white/10">
          <CardHeader>
            <CardTitle>Configure Comparison</CardTitle>
            <CardDescription>Enter a prompt and select agents to compare their outputs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/80">Topic / Prompt</label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={suggestAgents} 
                  disabled={status === "suggesting" || !topic.trim()}
                  className="text-fuchsia-400 hover:text-fuchsia-300 hover:bg-fuchsia-500/10"
                >
                  {status === "suggesting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  Suggest Agents
                </Button>
              </div>
              <Input 
                placeholder="e.g., Explain the architecture of a scalable microservices system." 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={status === "running" || status === "synthesizing" || status === "suggesting"}
                className="h-12 text-base"
              />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-white/80">Select Agents</label>
                <span className="text-xs text-white/50">{selectedAgents.length} Selected</span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-1 scrollbar-hide">
                {AVAILABLE_AGENTS.map(agent => {
                  const isSelected = selectedAgents.includes(agent);
                  return (
                    <button
                      key={agent}
                      onClick={() => toggleAgent(agent)}
                      disabled={status === "running" || status === "synthesizing" || status === "suggesting"}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
                        isSelected 
                          ? "bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-300" 
                          : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white"
                      } cursor-pointer`}
                    >
                      {agent}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button 
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 text-white h-12 text-base" 
              onClick={runComparison}
              disabled={status === "running" || status === "synthesizing" || status === "suggesting" || !topic.trim() || selectedAgents.length < 2}
            >
              {status === "running" ? (
                <span className="flex items-center gap-2"><Zap className="w-5 h-5 animate-pulse" /> Running Agents...</span>
              ) : (
                <span className="flex items-center gap-2"><GitCompare className="w-5 h-5" /> Compare Agents</span>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {results.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">Agent Outputs</h2>
              {(status === "done" || status === "synthesizing" || status === "synthesized") && (
                <Button 
                  onClick={runSynthesis} 
                  disabled={status === "synthesizing" || status === "synthesized"}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {status === "synthesizing" ? (
                    <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 animate-pulse" /> Synthesizing...</span>
                  ) : status === "synthesized" ? (
                    <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Synthesized</span>
                  ) : (
                    <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Synthesize Best Output</span>
                  )}
                </Button>
              )}
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 ${results.length > 2 ? 'xl:grid-cols-3' : ''} gap-4`}>
              {results.map((result, idx) => (
                <Card key={idx} className="bg-black/40 border-white/10 flex flex-col max-h-[600px]">
                  <CardHeader className="py-4 border-b border-white/5 bg-white/5 shrink-0">
                    <CardTitle className="text-base flex items-center gap-2 text-fuchsia-300">
                      <Bot className="w-4 h-4" />
                      {result.agentName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 overflow-y-auto flex-1">
                    <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                      <ReactMarkdown>{result.content}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {synthesis && (
          <Card className="border border-emerald-500/30 bg-emerald-500/5 mt-8 overflow-hidden">
            <CardHeader className="bg-emerald-500/10 border-b border-emerald-500/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-emerald-400">Final Synthesized Output</CardTitle>
                  <CardDescription className="text-emerald-400/70">The Critic Agent has combined the best parts of all responses.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-emerald-500/20 prose-headings:text-emerald-300">
                <ReactMarkdown>{synthesis.final_synthesized_response}</ReactMarkdown>
              </div>
              
              <div className="mt-8 pt-6 border-t border-emerald-500/20">
                <div className="text-xs font-medium text-emerald-400/60 uppercase tracking-wider mb-4">Evaluation Metrics</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <MetricCard label="Accuracy" score={synthesis.accuracy} />
                  <MetricCard label="Clarity" score={synthesis.clarity} />
                  <MetricCard label="Completeness" score={synthesis.completeness} />
                  <MetricCard label="Efficiency" score={synthesis.efficiency} />
                </div>
                <div className="mt-4 text-sm text-emerald-200/80 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                  <span className="font-semibold text-emerald-400">Critic Feedback:</span> {synthesis.feedback}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, score }: { label: string, score: number }) {
  return (
    <div className="bg-black/40 border border-emerald-500/20 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-[10px] text-emerald-400/60 uppercase tracking-wider">{label}</span>
      <div className="flex items-end gap-1.5">
        <span className="text-2xl font-bold leading-none font-mono text-emerald-400">{score}</span>
        <span className="text-xs text-emerald-400/40 mb-0.5">/100</span>
      </div>
    </div>
  );
}
