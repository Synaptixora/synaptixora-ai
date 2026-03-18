import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Swords, Bot, Zap, Trophy, MessageSquare } from "lucide-react";
import { MODELS, generateContentWithRetry } from "@/services/ai/gemini";
import ReactMarkdown from "react-markdown";

export default function Arena() {
  const [topic, setTopic] = useState("");
  const [agent1, setAgent1] = useState("Logic & Reasoning Agent");
  const [agent2, setAgent2] = useState("Creative Writing Agent");
  const [status, setStatus] = useState<"idle" | "debating" | "complete">("idle");
  const [debateLog, setDebateLog] = useState<{ agent: string; content: string }[]>([]);
  const [winner, setWinner] = useState<{ agent: string; reason: string } | null>(null);

  const startDebate = async () => {
    if (!topic.trim()) return;
    setStatus("debating");
    setDebateLog([]);
    setWinner(null);

    try {
      // Agent 1 Opening Statement
      const a1Opening = await generateContentWithRetry({
        model: MODELS.FAST,
        contents: `You are the ${agent1}. Present your opening argument for the topic: "${topic}". Be persuasive and highlight your unique perspective. Keep it under 150 words.`,
      });
      setDebateLog(prev => [...prev, { agent: agent1, content: a1Opening.text || "" }]);

      // Agent 2 Rebuttal & Opening
      const a2Opening = await generateContentWithRetry({
        model: MODELS.FAST,
        contents: `You are the ${agent2}. The topic is "${topic}". The ${agent1} just argued: "${a1Opening.text}". Provide a rebuttal and present your counter-argument. Keep it under 150 words.`,
      });
      setDebateLog(prev => [...prev, { agent: agent2, content: a2Opening.text || "" }]);

      // Agent 1 Final Rebuttal
      const a1Closing = await generateContentWithRetry({
        model: MODELS.FAST,
        contents: `You are the ${agent1}. The ${agent2} just countered with: "${a2Opening.text}". Provide your final closing statement to win the debate. Keep it under 100 words.`,
      });
      setDebateLog(prev => [...prev, { agent: agent1, content: a1Closing.text || "" }]);

      // Critic Evaluates
      const evaluation = await generateContentWithRetry({
        model: MODELS.COMPLEX,
        contents: `Evaluate this debate between ${agent1} and ${agent2} on the topic: "${topic}".
        
        ${agent1}: ${a1Opening.text}
        ${agent2}: ${a2Opening.text}
        ${agent1}: ${a1Closing.text}
        
        Who won the debate based on logic, persuasiveness, and clarity? Return JSON: {"winner": "Agent Name", "reason": "Brief explanation"}`,
        config: { responseMimeType: "application/json" }
      });

      const result = JSON.parse(evaluation.text || "{}");
      setWinner({ agent: result.winner, reason: result.reason });
      setStatus("complete");

    } catch (error) {
      console.error("Debate failed", error);
      setStatus("idle");
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-6 space-y-8">
      <header className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Swords className="w-8 h-8 text-rose-500" />
            Agent Arena
          </h1>
          <p className="text-white/60 mt-2">AI Debate Mode: Watch specialized agents argue different approaches.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 bg-black/40 border-white/10 h-fit">
          <CardHeader>
            <CardTitle>Configure Match</CardTitle>
            <CardDescription>Set the topic and select combatants.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Debate Topic</label>
              <Input 
                placeholder="e.g., Is React better than Vue?" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={status === "debating"}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Agent 1 (Proponent)</label>
              <select 
                className="flex h-10 w-full rounded-md border border-white/20 bg-black/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                value={agent1}
                onChange={(e) => setAgent1(e.target.value)}
                disabled={status === "debating"}
              >
                <option>Logic & Reasoning Agent</option>
                <option>Coding Agent</option>
                <option>System Architect Agent</option>
                <option>Fact-Checker Agent</option>
              </select>
            </div>
            <div className="flex items-center justify-center py-2">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                <span className="text-xs font-bold text-rose-400">VS</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Agent 2 (Opponent)</label>
              <select 
                className="flex h-10 w-full rounded-md border border-white/20 bg-black/50 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                value={agent2}
                onChange={(e) => setAgent2(e.target.value)}
                disabled={status === "debating"}
              >
                <option>Creative Writing Agent</option>
                <option>UI/UX Designer Agent</option>
                <option>Data Analyst Agent</option>
                <option>Critic Agent</option>
              </select>
            </div>
            <Button 
              className="w-full mt-4 bg-rose-600 hover:bg-rose-700 text-white" 
              onClick={startDebate}
              disabled={status === "debating" || !topic.trim()}
            >
              {status === "debating" ? (
                <span className="flex items-center gap-2"><Zap className="w-4 h-4 animate-pulse" /> Simulating Debate...</span>
              ) : (
                <span className="flex items-center gap-2"><Swords className="w-4 h-4" /> Start Match</span>
              )}
            </Button>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {debateLog.length === 0 && status === "idle" ? (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/5">
              <MessageSquare className="w-12 h-12 text-white/20 mb-4" />
              <p className="text-white/40 text-center max-w-sm">
                Configure a match and start the debate to watch agents argue their perspectives.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {debateLog.map((log, index) => (
                <Card key={index} className={`border-l-4 ${log.agent === agent1 ? 'border-l-indigo-500' : 'border-l-rose-500'} bg-black/40`}>
                  <CardHeader className="py-4 pb-2 flex flex-row items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.agent === agent1 ? 'bg-indigo-500/20 text-indigo-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      <Bot className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-base">{log.agent}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-invert max-w-none prose-sm">
                      <ReactMarkdown>{log.content}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {winner && (
                <Card className="border border-amber-500/30 bg-amber-500/10 mt-8">
                  <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                      <Trophy className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <CardDescription className="text-amber-400/80 font-medium uppercase tracking-wider text-xs">Critic's Verdict</CardDescription>
                      <CardTitle className="text-xl text-amber-400">Winner: {winner.agent}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/80 leading-relaxed">{winner.reason}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
